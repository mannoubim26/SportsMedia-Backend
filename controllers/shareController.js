const interactionModel = require('../models/interactionModel');
const postModel = require('../models/postModel');

async function toggleShare(req, res, next) {
  const postId = Number(req.params.id);

  try {
    const post = await postModel.getPostOwner(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const result = await interactionModel.toggleShare(req.user.userId, postId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { toggleShare };
