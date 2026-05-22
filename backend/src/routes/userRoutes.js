const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserCreatedPosts,
  getUserSavedPosts,
  updateUserProfile
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile/:username', getUserProfile);
router.get('/profile/:username/created', getUserCreatedPosts);
router.get('/profile/:username/saved', getUserSavedPosts);
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
