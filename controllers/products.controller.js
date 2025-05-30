let {validationResult}=require('express-validator')
const bcrypt=require('bcryptjs')
const Product = require("../db/models/seedproduct.js")
let Review = require("../db/models/review.js")

const jwt=require('jsonwebtoken');

require('dotenv').config();

let getAllProducts=async (req,res)=>{
    try {
        const { city } = req.query;
        let query = {};
        
        if (city && city !== "All Cities") {
            query.location = { $regex: new RegExp(city, 'i') };
        }
        
        let products = await Product.find(query);
        if(!products || products.length === 0) {
            return res.status(404).json({success:false,message:"No products found"})
        }
        return res.status(200).json({success:true,products:products})
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching products"
        });
    }
}

let product=async (req,res)=>{
    try {
        let id=req.params.id
        let product=await Product.findById(id)
        
        if(!product)
        {
            return res.status(404).json({success:false,message:"No products found"})
        }
        
        // Get review statistics for the product
        const reviews = await Review.find({ productId: id }).sort({ date: -1 });
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
        
        // Include the top 3 most recent reviews
        const recentReviews = reviews.slice(0, 3);
        
        return res.status(200).json({
            success:true,
            product: product,
            reviewStats: {
                totalReviews: reviews.length,
                averageRating: parseFloat(averageRating),
                ratingDistribution: ratingCounts
            },
            recentReviews: recentReviews
        })
    } catch (error) {
        console.error('Error fetching product details:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching product details"
        });
    }
}

const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }

        const {
            name,
            description,
            price,
            category,
            location,
            availability,
            renting
        } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            images: req.body.images || "https://via.placeholder.com/500x300?text=No+Image+Available",
            seller: req.userId,
            location,
            availability: availability || "Available",
            renting: renting || {
                days: price
            }
        });

        await newProduct.save();

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating product"
        });
    }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const { city } = req.query;
        let query = { isFeatured: true };
        
        if (city && city !== "All Cities") {
            query.location = { $regex: new RegExp(city, 'i') };
        }
        
        const featuredProducts = await Product.find(query);
        
        if (featuredProducts.length === 0) {
            // If no featured products, return the first 4 products from the city
            const defaultProducts = await Product.find(city && city !== "All Cities" ? { location: { $regex: new RegExp(city, 'i') } } : {})
                .limit(4);
            return res.status(200).json({
                success: true,
                featuredProducts: defaultProducts
            });
        }
        
        return res.status(200).json({
            success: true,
            featuredProducts: featuredProducts
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching featured products"
        });
    }
};

// Search products with pagination
const searchProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 10, city } = req.query;
        console.log('Search parameters:', { search, category, page, limit, city });

        // Build the query
        const query = {};
        
        // Add search term to query if provided
        if (search && search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            
            // Match products that contain the search term anywhere in the name
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        // Add category filter if provided
        if (category) {
            const categories = category.split(',');
            query.category = { $in: categories };
        }

        // Add city filter if provided
        if (city && city !== "All Cities") {
            query.location = { $regex: new RegExp(city, 'i') };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        console.log('MongoDB query:', query);
        console.log('Pagination:', { skip, limit, totalProducts, totalPages });

        // Execute the query with pagination and sorting
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Found products:', products.length);

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                productsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error searching products:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while searching products",
            error: error.message
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching product"
        });
    }
};

module.exports={
    getAllProducts,
    product,
    createProduct,
    getFeaturedProducts,
    searchProducts,
    getProductById
}