const { validationResult } = require('express-validator');
const Order = require('../db/models/order.js');
const User = require('../db/models/user.js');
const Product = require('../db/models/seedproduct.js');
const mongoose = require('mongoose');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Count total users, products, orders
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        
        // Calculate revenue
        const completedOrders = await Order.find({ status: 'paid' });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
        
        return res.status(200).json({
            success: true,
            stats: {
                userCount,
                productCount,
                orderCount,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching admin statistics"
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching users"
        });
    }
};

// Ban or delete user
const manageUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (action === "ban") {
            user.status = "banned";
            await user.save();
            return res.status(200).json({
                success: true,
                message: "User has been banned"
            });
        } else if (action === "unban") {
            user.status = "active";
            await user.save();
            return res.status(200).json({
                success: true,
                message: "User has been unbanned"
            });
        } else if (action === "delete") {
            await User.findByIdAndDelete(userId);
            return res.status(200).json({
                success: true,
                message: "User has been deleted"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action specified"
            });
        }
    } catch (error) {
        console.error('Error managing user:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while managing user"
        });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        
        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching products"
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        // Update only fields that are provided
        if (updates.name) product.name = updates.name;
        if (updates.description) product.description = updates.description;
        if (updates.price) product.price = updates.price;
        if (updates.category) product.category = updates.category;
        if (updates.images) product.images = updates.images;
        if (updates.location) product.location = updates.location;
        if (updates.availability) product.availability = updates.availability;
        if (updates.isFeatured !== undefined) product.isFeatured = updates.isFeatured;
        if (updates.renting) product.renting = updates.renting;
        
        await product.save();
        
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating product"
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }
        
        await Product.findByIdAndDelete(productId);
        
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting product"
        });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        
        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching orders"
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        order.status = status;
        order.updatedAt = Date.now();
        await order.save();
        
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false, 
            message: "Server error while updating order status"
        });
    }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true });
        
        return res.status(200).json({
            success: true,
            count: featuredProducts.length,
            featuredProducts
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching featured products"
        });
    }
};

// Set featured products
const setFeaturedProducts = async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                message: "Product IDs must be provided as an array"
            });
        }
        
        // First, unfeature all products
        await Product.updateMany({}, { isFeatured: false });
        
        // Then, feature the selected products
        await Product.updateMany(
            { _id: { $in: productIds } },
            { isFeatured: true }
        );
        
        return res.status(200).json({
            success: true,
            message: "Featured products updated successfully"
        });
    } catch (error) {
        console.error('Error setting featured products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while setting featured products"
        });
    }
};

// Verify admin status
const verifyAdmin = async (req, res) => {
    try {
        // If the request made it this far, the user is authenticated and is an admin
        // (thanks to the auth and isAdmin middleware)
        return res.status(200).json({
            success: true,
            message: "Admin verification successful",
            isAdmin: true
        });
    } catch (error) {
        console.error('Error verifying admin:', error);
        return res.status(500).json({
            success: false,
            message: "Server error during admin verification",
            clearAuth: true
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    manageUser,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    getFeaturedProducts,
    setFeaturedProducts,
    verifyAdmin
};
