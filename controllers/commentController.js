const commentModel = require('../models/commentModel');
const postModel = require('../models/postModel');

async function listComments(req, res, next) {
  const postId = Number(req.params.id);
  try {
    const post = await postModel.getPostOwner(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    const comments = await commentModel.listComments(postId);
    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
}

async function createComment(req, res, next) {
  const postId = Number(req.params.id);
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ success: false, message: 'text is required.' });
  }

  try {
    const post = await postModel.getPostOwner(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const commentId = await commentModel.createComment({
      userId: req.user.userId,
      postId,
      text: String(text).trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: { comment_id: commentId },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  const commentId = Number(req.params.id);

  try {
    const comment = await commentModel.getCommentOwner(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }
    if (comment.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await commentModel.deleteComment(commentId);
    res.json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listComments, createComment, deleteComment };
