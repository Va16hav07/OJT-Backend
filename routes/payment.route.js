const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth.js');
const { 
    processPayment, 
    getPaymentByOrderId 
} = require('../controllers/payment.controller.js');

const paymentRouter = express.Router();

// Process a payment for an order (requires authentication)
paymentRouter.post('/process',
    auth,
    [
        check('orderId').notEmpty().withMessage('Order ID is required'),
        check('paymentMethod').isIn(['card', 'paypal']).withMessage('Payment method must be card or paypal')
    ],
    processPayment
);

// Get payment details for a specific order (requires authentication)
paymentRouter.get('/order/:orderId', auth, getPaymentByOrderId);

module.exports = paymentRouter;
