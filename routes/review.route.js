const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth.js');
const { 
    createReview, 
    getReviewsByProduct, 
    updateReview, 
    deleteReview,
    getReviewStats
} = require('../controllers/review.controller.js');

const reviewRouter = express.Router();

// Create a new review (requires authentication)
reviewRouter.post('/',
    auth,
    [
        check('productId').notEmpty().withMessage('Product ID is required'),
        check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        check('comment').notEmpty().withMessage('Review comment is required')
    ],
    createReview
);

// Get all reviews for a specific product
reviewRouter.get('/product/:productId', getReviewsByProduct);

// Get review statistics for a product (average rating, count by star)
reviewRouter.get('/stats/:productId', getReviewStats);

// Update a review (requires authentication)
reviewRouter.put('/:id',
    auth,
    [
        check('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        check('comment').optional().notEmpty().withMessage('Review comment cannot be empty')
    ],
    updateReview
);

// Delete a review (requires authentication)
reviewRouter.delete('/:id', auth, deleteReview);

module.exports = reviewRouter;
