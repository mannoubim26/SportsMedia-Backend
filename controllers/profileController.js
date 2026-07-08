const profileModel = require('../models/profileModel');
const userModel = require('../models/userModel');

async function getProfile(req, res, next) {
  try {
    const profile = await profileModel.getProfileByUserId(req.user.userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  const { name, age, bio } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    await profileModel.updateProfile(req.user.userId, { name, age, bio, profilePicture });
    const profile = await profileModel.getProfileByUserId(req.user.userId);
    res.json({ success: true, message: 'Profile updated successfully.', data: profile });
  } catch (error) {
    next(error);
  }
}

async function deleteProfile(req, res, next) {
  try {
    // Deleting the user cascades to profile, posts, comments, likes, shares
    await userModel.deleteUser(req.user.userId);
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, deleteProfile };
