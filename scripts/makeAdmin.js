require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../db/models/user');

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node makeAdmin.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/equiply')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        console.error(`User with email ${email} not found`);
        process.exit(1);
      }
      
      // Set user type to admin
      user.type = 'admin';
      await user.save();
      
      console.log(`User ${email} has been made an admin`);
      console.log('User details:', {
        name: user.name,
        email: user.email,
        type: user.type
      });
      
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
