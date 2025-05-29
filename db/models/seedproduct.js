const mongoose = require('mongoose');
const products = require('./products'); 
const connectDB = require('./connection');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: {
        type: [String],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

// Seed the database with initial products if none exist
const seedDatabase = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            // Add isFeatured flag to some products
            const productsWithFeatured = products.map((product, index) => ({
                ...product,
                isFeatured: index < 4 // First 4 products are featured
            }));
            
            await Product.insertMany(productsWithFeatured);
            console.log('Database seeded with initial products');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Call seedDatabase when the model is first loaded
seedDatabase();

module.exports = Product;

