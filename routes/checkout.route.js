const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth.js');
const checkBanned = require('../middleware/checkBanned.js');
const { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrder 
} = require('../controllers/checkout.controller.js');

const checkoutRouter = express.Router();

// Create a new order (requires authentication)
checkoutRouter.post('/',
    auth,
    checkBanned,
    [
        check('products').isArray().withMessage('Products must be an array'),
        check('products.*.productId').optional(),  // Make productId validation optional
        check('products.*.rentalPeriod').optional().isInt({ min: 1 }).withMessage('Rental period must be at least 1'),
        check('address').isObject().withMessage('Address must be an object'),
        check('address.fullAddress').notEmpty().withMessage('Delivery address is required'),
        check('subtotal').isNumeric().withMessage('Subtotal must be a number'),
        check('tax').isNumeric().withMessage('Tax must be a number'),
        check('total').isNumeric().withMessage('Total must be a number'),
        check('paymentMethod').optional().isIn(['card', 'paypal', 'pending']).withMessage('Payment method must be card, paypal, or pending')
    ],
    createOrder
);

// Get all orders for the current user (requires authentication)
checkoutRouter.get('/my-orders', auth, checkBanned, getUserOrders);

// Get a specific order by ID (requires authentication)
checkoutRouter.get('/:orderId', auth, checkBanned, getOrderById);

// Update an order (e.g., cancel) (requires authentication)
checkoutRouter.patch('/:orderId',
    auth,
    checkBanned,
    [
        check('status').isIn(['cancelled']).withMessage('Can only update status to cancelled')
    ],
    updateOrder
);

module.exports = checkoutRouter;
