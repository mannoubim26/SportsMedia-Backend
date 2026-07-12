const express = require('express');
const userController = require('../controllers/userController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public profile — returns name, bio, profile picture (no email)
router.get('/:id/profile', userController.getUserProfile);

// Posts by a specific user — auth optional so logged-in users get has_liked/has_shared
router.get('/:id/posts', optionalAuth, userController.getUserPosts);

module.exports = router;
