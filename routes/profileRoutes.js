const express = require('express');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload, validateImageMagicBytes } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', requireAuth, profileController.getProfile);
router.put('/', requireAuth, upload.single('profile_picture'), validateImageMagicBytes, profileController.updateProfile);
router.delete('/', requireAuth, profileController.deleteProfile);

module.exports = router;
