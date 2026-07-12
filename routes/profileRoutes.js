const express = require('express');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', requireAuth, profileController.getProfile);
router.get('/:userId', profileController.getPublicProfile);
router.put('/', requireAuth, upload.single('profile_picture'), profileController.updateProfile);
router.delete('/', requireAuth, profileController.deleteProfile);

module.exports = router;
