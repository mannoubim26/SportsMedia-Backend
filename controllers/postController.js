const postModel = require('../models/postModel');
const { parseHashtags } = require('../utils/helpers');

async function listPosts(req, res, next) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const userId = req.user ? req.user.userId : null;

  try {
    const { posts, total } = await postModel.listPosts({ page, limit, userId });
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

async function getPost(req, res, next) {
  const postId = Number(req.params.id);
  const userId = req.user ? req.user.userId : null;

  try {
    const post = await postModel.getPostById(postId, userId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  const { title, description, category_id } = req.body;
  const hashtags = parseHashtags(req.body.hashtags);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'title is required.' });
  }

  try {
    const postId = await postModel.createPost(req.user.userId, {
      title: String(title).trim(),
      description: description || null,
      imageUrl,
      categoryId: category_id ? Number(category_id) : null,
      hashtags,
    });

    const post = await postModel.getPostById(postId, req.user.userId);
    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: post,
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid category_id.' });
    }
    next(error);
  }
}

async function updatePost(req, res, next) {
  const postId = Number(req.params.id);

  try {
    const owner = await postModel.getPostOwner(postId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    if (owner.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, category_id } = req.body;
    const hashtags = req.body.hashtags !== undefined ? parseHashtags(req.body.hashtags) : undefined;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    await postModel.updatePost(postId, {
      title: title !== undefined ? String(title).trim() : undefined,
      description,
      imageUrl,
      categoryId: category_id !== undefined ? (category_id ? Number(category_id) : null) : undefined,
      hashtags,
    });

    const post = await postModel.getPostById(postId, req.user.userId);
    res.json({ success: true, message: 'Post updated successfully.', data: post });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid category_id.' });
    }
    next(error);
  }
}

async function deletePost(req, res, next) {
  const postId = Number(req.params.id);

  try {
    const owner = await postModel.getPostOwner(postId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    if (owner.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await postModel.deletePost(postId);
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };
