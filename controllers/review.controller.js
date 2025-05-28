const { validationResult } = require('express-validator');
const Review = require('../db/models/review.js');
const User = require('../db/models/user.js');
const Product = require('../db/models/seedproduct.js');
const mongoose = require('mongoose');

// Create a new review
const createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation error", 
                errors: errors.array() 
            });
        }

        const { productId, rating, comment } = req.body;
        const userId = req.userId; // From auth middleware

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        // Get user information for the userName
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Check if user is banned
        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. You cannot post reviews."
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already reviewed this product" 
            });
        }

        // Create the review
        const newReview = new Review({
            userId,
            productId,
            userName: user.name,
            rating,
            comment
        });

        await newReview.save();

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            review: newReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating review"
        });
    }
};

// Get all reviews for a specific product
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get reviews for the product, sorted by date (newest first)
        const reviews = await Review.find({ productId })
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching reviews"
        });
    }
};

// Get review statistics for a product
const getReviewStats = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get the count of reviews and average rating
        const reviews = await Review.find({ productId });
        
        // Calculate average rating
        let totalRating = 0;
        const ratingCounts = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };
        
        reviews.forEach(review => {
            totalRating += review.rating;
            ratingCounts[review.rating] += 1;
        });

        const averageRating = reviews.length > 0 
            ? (totalRating / reviews.length).toFixed(1) 
            : 0;

        return res.status(200).json({
            success: true,
            stats: {
                totalReviews: reviews.length,
                averageRating: parseFloat(averageRating),
                ratingDistribution: ratingCounts
            }
        });
    } catch (error) {
        console.error('Error fetching review stats:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching review statistics"
        });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId; // From auth middleware

        // Validate review ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID format"
            });
        }

        // Find the review
        const review = await Review.findById(id);
        
        // Check if review exists
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if user is the owner of the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own reviews"
            });
        }

        // Check if user is banned
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. You cannot update reviews."
            });
        }

        // Update the review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating review"
        });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // From auth middleware

        // Validate review ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID format"
            });
        }

        // Find the review
        const review = await Review.findById(id);
        
        // Check if review exists
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if user is the owner of the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own reviews"
            });
        }

        // Delete the review
        await Review.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting review"
        });
    }
};

module.exports = {
    createReview,
    getReviewsByProduct,
    updateReview,
    deleteReview,
    getReviewStats
};
