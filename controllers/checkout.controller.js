const { validationResult } = require('express-validator');
const Order = require('../db/models/order.js');
const Product = require('../db/models/seedproduct.js');
const mongoose = require('mongoose');

// Create a new checkout order
const createOrder = async (req, res) => {
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
        const { products, address, subtotal, tax, total, paymentMethod } = req.body;
        
        // Log the received data for debugging
        console.log('Creating order with:', {
            userId,
            productsCount: products?.length || 0,
            address,
            subtotal,
            tax,
            total,
            paymentMethod
        });
        
        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Products are required" 
            });
        }
        
        // Validate address
        if (!address || !address.fullAddress) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery address is required" 
            });
        }
        
        // Create new order with default payment method if not provided
        const newOrder = new Order({
            userId: new mongoose.Types.ObjectId(userId),
            products: products.map(product => ({
                productId: mongoose.Types.ObjectId.isValid(product.productId) 
                    ? new mongoose.Types.ObjectId(product.productId)
                    : null,
                name: product.name || 'Unknown Product',
                price: parseFloat(product.price) || 0,
                rentalDuration: product.rentalDuration || 'days',
                rentalPeriod: parseInt(product.rentalPeriod) || 1
            })),
            address: {
                label: address.label || '',
                type: address.type || '',
                fullAddress: address.fullAddress || '',
                phone: address.phone || ''
            },
            subtotal: parseFloat(subtotal) || 0,
            tax: parseFloat(tax) || 0,
            total: parseFloat(total) || 0,
            paymentMethod: paymentMethod || 'pending', // Default to pending if not provided
            status: 'pending'
        });
        
        await newOrder.save();
        
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating order: " + error.message
        });
    }
};

// Get orders for the current user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching orders"
        });
    }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
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
        
        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching order details"
        });
    }
};

// Update an order (e.g., cancel order)
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const userId = req.userId; // From auth middleware
        
        // Validate orderId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        
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
        
        // Update order status
        if (status) {
            order.status = status;
            order.updatedAt = Date.now();
        }
        
        await order.save();
        
        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating order"
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrder
};
