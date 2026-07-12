const profileModel = require('../models/profileModel');
const postModel = require('../models/postModel');
const pool = require('../config/db');

async function getUserProfile(req, res, next) {
  const userId = Number(req.params.id);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.user_id, u.name, u.created_at,
              p.bio, p.profile_picture
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    res.json({
      success: true,
      data: {
        user_id:         user.user_id,
        name:            user.name,
        bio:             user.bio || null,
        profile_picture: user.profile_picture || null,
        created_at:      user.created_at,
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
