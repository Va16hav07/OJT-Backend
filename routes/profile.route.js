const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth.js');
const checkBanned = require('../middleware/checkBanned.js');
const { getProfile, updateProfile, addAddress, editAddress, deleteAddress } = require('../controllers/profile.controller.js');

const profileRouter = express.Router();

// Get user profile with orders and addresses
profileRouter.get('/', auth, checkBanned, getProfile);

// Update user profile
profileRouter.put('/', auth, checkBanned, [
    check('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    check('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty')
], updateProfile);

// Add new address
profileRouter.post('/address', auth, checkBanned, [
    check('label').trim().notEmpty().withMessage('Label is required'),
    check('address').trim().notEmpty().withMessage('Address is required'),
    check('phone').trim().notEmpty().withMessage('Phone number is required'),
    check('type').optional().isIn(['Home', 'Office', 'Other']).withMessage('Invalid address type')
], addAddress);

// Edit address
profileRouter.put('/address/:addressId', auth, checkBanned, [
    check('label').trim().notEmpty().withMessage('Label is required'),
    check('address').trim().notEmpty().withMessage('Address is required'),
    check('phone').trim().notEmpty().withMessage('Phone number is required'),
    check('type').optional().isIn(['Home', 'Office', 'Other']).withMessage('Invalid address type')
], editAddress);

// Delete address
profileRouter.delete('/address/:addressId', auth, checkBanned, deleteAddress);

module.exports = profileRouter; 