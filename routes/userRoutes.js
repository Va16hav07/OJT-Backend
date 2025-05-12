const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  updateSubscription,
  getUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/subscription').put(protect, updateSubscription);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
