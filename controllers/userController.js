const profileModel = require('../models/profileModel');
const postModel = require('../models/postModel');

async function getUserProfile(req, res, next) {
  const userId = Number(req.params.id);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID.' });
  }

  try {
    const profile = await profileModel.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Return only public fields — never expose email
    res.json({
      success: true,
      data: {
        user_id:         profile.user_id,
        name:            profile.name,
        bio:             profile.bio,
        profile_picture: profile.profile_picture,
        created_at:      profile.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserPosts(req, res, next) {
  const authorId = Number(req.params.id);

  if (!authorId || isNaN(authorId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID.' });
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const userId = req.user ? req.user.userId : null;

  try {
    const { posts, total } = await postModel.listPosts({ page, limit, userId, authorId });
    res.json({
      success: true,
      data: {
        posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUserProfile, getUserPosts };
