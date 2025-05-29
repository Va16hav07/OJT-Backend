const { validationResult } = require('express-validator');
const Order = require('../db/models/order.js');
const Payment = require('../db/models/payment.js');
const Notification = require('../db/models/notification.js')
const mongoose = require('mongoose');

// Process a payment for an order
const processPayment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation error", 
                errors: errors.array() 
            });
        }

        const userId = req.userId; // From auth middleware
        const { orderId, paymentMethod, paymentDetails } = req.body;
        
        // Validate orderId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        
        // Get the order
        const order = await Order.findById(orderId);
        
        // Check if order exists
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        // Ensure the user owns this order
        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied: This order belongs to another user"
            });
        }
        
        // Check if order is already paid
        if (order.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: "Order has already been paid"
            });
        }
        
        // Create payment record
        const payment = new Payment({
            orderId,
            userId,
            amount: order.total,
            paymentMethod,
            paymentDetails,
            status: 'pending'
        });
        
        // In a real application, this is where you would integrate with a payment processor
        // For this example, we'll simulate a payment processing
        
        // Simulate payment processing
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
        
        if (paymentSuccess) {
            payment.status = 'completed';
            order.status = 'paid';
            // Update the payment method on the order to match what was selected
            order.paymentMethod = paymentMethod;
            order.updatedAt = Date.now();
            
            await payment.save();
            await order.save();

            // Create a notification for the user
            await Notification.create({
                userId: order.userId,
                message: `Your order for "${order.products[0].name}" has been placed successfully!`
            });
            
            return res.status(200).json({
                success: true,
                message: "Payment processed successfully",
                payment,
                order
            });
        } else {
            payment.status = 'failed';
            await payment.save();
            
            return res.status(400).json({
                success: false,
                message: "Payment processing failed. Please try again.",
                payment
            });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while processing payment"
        });
    }
};

// Get payment details for a specific order
const getPaymentByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId; // From auth middleware
        
        // Validate orderId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        
        // Get the payment
        const payment = await Payment.findOne({ orderId });
        
        // Check if payment exists
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found for this order"
            });
        }
        
        // Ensure the user owns this payment
        if (payment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied: This payment belongs to another user"
            });
        }
        
        return res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching payment details"
        });
    }
};

module.exports = {
    processPayment,
    getPaymentByOrderId
};
