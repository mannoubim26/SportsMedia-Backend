const express = require('express');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// DELETE /api/comments/:id — delete own comment
router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;
