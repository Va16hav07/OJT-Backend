const Product = require('../db/models/seedproduct');
const products = require('../db/models/products');
const connectDB = require('../db/models/connection');

async function seedDatabase() {
    try {
        await connectDB();
        await Product.deleteMany();
        await Product.insertMany(products);
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();