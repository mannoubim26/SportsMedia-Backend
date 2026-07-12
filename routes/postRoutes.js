const express = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const shareController = require('../controllers/shareController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { upload, validateImageMagicBytes } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Feed & single post (auth optional so unauthenticated users can browse)
router.get('/', optionalAuth, postController.listPosts);
router.get('/:id', optionalAuth, postController.getPost);

// Post CRUD (auth required)
router.post('/', requireAuth, upload.single('image'), validateImageMagicBytes, postController.createPost);
router.put('/:id', requireAuth, upload.single('image'), validateImageMagicBytes, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

// Comments nested under posts
router.get('/:id/comments', commentController.listComments);
router.post('/:id/comments', requireAuth, commentController.createComment);

// Like & share toggles
router.post('/:id/like', requireAuth, likeController.toggleLike);
router.post('/:id/share', requireAuth, shareController.toggleShare);

module.exports = router;
