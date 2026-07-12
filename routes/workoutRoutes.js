const express = require('express');
const workoutController = require('../controllers/workoutController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload, validateImageMagicBytes } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', workoutController.listWorkouts);
router.get('/:slug', workoutController.getWorkoutBySlug);
router.post('/', requireAuth, upload.single('image'), validateImageMagicBytes, workoutController.createWorkout);
router.put('/:postId', requireAuth, upload.single('image'), validateImageMagicBytes, workoutController.updateWorkout);
router.delete('/:postId', requireAuth, workoutController.deleteWorkout);

module.exports = router;
