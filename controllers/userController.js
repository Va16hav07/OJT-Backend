const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { 
    schoolName,
    schoolCode,
    schoolType,
    schoolBoard,
    establishmentYear,
    principalName,
    principalEmail,
    principalPhone,
    adminEmail,
    adminPhone,
    totalStudents,
    totalTeachers,
    address,
    city,
    state,
    pincode,
    website,
    password
  } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ principalEmail });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    principalName,
    principalEmail,
    principalPhone,
    adminEmail,
    adminPhone,
    password,
    schoolInfo: {
      schoolName,
      schoolCode,
      schoolType,
      schoolBoard,
      establishmentYear,
      totalStudents,
      totalTeachers,
      address,
      city,
      state,
      pincode,
      website
    }
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      principalName: user.principalName,
      principalEmail: user.principalEmail,
      adminEmail: user.adminEmail,
      isEnrolled: user.isEnrolled,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by either principal email or admin email
  const user = await User.findOne({
    $or: [
      { principalEmail: email },
      { adminEmail: email }
    ]
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      principalName: user.principalName,
      principalEmail: user.principalEmail,
      adminEmail: user.adminEmail,
      isEnrolled: user.isEnrolled,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Update user subscription status
// @route   PUT /api/users/subscription
// @access  Private
const updateSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.isEnrolled = true;
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      isEnrolled: updatedUser.isEnrolled
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      principalName: user.principalName,
      principalEmail: user.principalEmail,
      adminEmail: user.adminEmail,
      isEnrolled: user.isEnrolled,
      schoolInfo: user.schoolInfo
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { registerUser, loginUser, updateSubscription, getUserProfile };
