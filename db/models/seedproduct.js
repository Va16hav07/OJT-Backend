const mongoose = require('mongoose');
const products = require('./products'); 
const connectDB = require('./connection');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: {
        type: [String], // Changed to array of strings
        required: true,
        default: []
    },
    seller: { type: String, required: true },
    location: { type: String, required: true },
    availability: { type: String, required: true },
    isFeatured: {
        type: Boolean,
        default: false
    },
    renting: {
        hours: { type: Number, required: false },
        days: { type: Number, required: false },
        weeks: { type: Number, required: false },
        months: { type: Number, required: false },
    },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

