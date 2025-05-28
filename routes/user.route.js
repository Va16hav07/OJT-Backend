const express = require('express');
const {check} = require('express-validator');   
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');
const checkBanned = require('../middleware/checkBanned.js');
const isAdmin = require('../middleware/isAdmin.js');
const {
    updateUser,
    deleteUser,
    signinUser,
    signupUser,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress
} = require('../controllers/user.controller.js');

const userRouter = express.Router();

// Public routes
userRouter.post('/signin', [
    check('email').not().normalizeEmail(),
    check('password').not()
], signinUser);

userRouter.post('/signup', [
    check('email').not().normalizeEmail(),
    check('password').notEmpty()
], signupUser);

// Protected routes
userRouter.get('/addresses', auth, checkBanned, getUserAddresses);
userRouter.post('/address', auth, checkBanned, [
    check('label').notEmpty().withMessage('Address label is required'),
    check('address').notEmpty().withMessage('Full address is required'),
    check('phone').notEmpty().withMessage('Phone number is required')
], addUserAddress);
userRouter.put('/address/:addressId', auth, checkBanned, updateUserAddress);
userRouter.delete('/address/:addressId', auth, checkBanned, deleteUserAddress);
userRouter.put('/default-address', auth, checkBanned, setDefaultAddress);

// Admin routes
userRouter.patch('/:email', auth, checkBanned, updateUser);
userRouter.delete('/:email', auth, checkBanned, deleteUser);

module.exports = userRouter;