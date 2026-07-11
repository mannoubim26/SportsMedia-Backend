const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

// POST /api/upload — upload an image and get back its URL
router.post('/', requireAuth, upload.single('image'), uploadImage);

module.exports = router;
