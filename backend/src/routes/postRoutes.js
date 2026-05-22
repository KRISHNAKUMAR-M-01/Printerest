const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  toggleLike,
  toggleSave,
  addComment
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Private routes (require authentication)
router.post('/', authMiddleware, upload.single('image'), createPost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, toggleLike);
router.post('/:id/save', authMiddleware, toggleSave);
router.post('/:id/comments', authMiddleware, addComment);

module.exports = router;
