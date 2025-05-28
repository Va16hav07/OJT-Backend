const jwt = require('jsonwebtoken');
const userModel = require('../db/models/user.js');
require('dotenv').config();

const googleAuth = async (req, res) => {
    try {
        const { name, email, googleId } = req.body;

        if (!name || !email || !googleId) {
            return res.status(400).json({
                success: false, 
                message: "Missing required fields for Google authentication"
            });
        }

        console.log(`Processing Google auth for: ${email}`);

        // Check if user already exists
        let user = await userModel.findOne({ email });
        
        if (!user) {
            // Create new user if doesn't exist
            console.log(`Creating new user for: ${email}`);
            
            user = new userModel({
                name,
                email,
                googleId,  
                type: 'customer',
                status: 'active',
                password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12),
                authProvider: 'google' // Track auth provider
            });
            
            await user.save();
            console.log('New Google user created:', email);
        } else {
            // If user exists but doesn't have a googleId, update it
            if (!user.googleId) {
                console.log(`Updating existing user with Google ID: ${email}`);
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
            
            // Check if user is banned
            if (user.status === "banned") {
                console.log(`Banned user attempted login: ${email}`);
                return res.status(403).json({
                    success: false, 
                    message: "Your account has been banned. Please contact support."
                });
            }
        }

        // Generate JWT token
        const payload = {
            userId: user._id,
            type: user.type,
            name: user.name
        };
        
        const tokenSecret = process.env.TOKEN_SECRET;
        
        console.log(`Generating token for user: ${email}`);
        
        jwt.sign(
            payload, 
            tokenSecret, 
            { expiresIn: 3600 }, 
            (err, token) => {
                if (err) {
                    console.error(`Token generation error for ${email}:`, err);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error generating token" 
                    });
                }
                
                console.log(`Login successful for: ${email}`);
                
                return res.status(200).json({ 
                    success: true, 
                    token: token, 
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        type: user.type,
                        status: user.status || 'active'
                    }
                });
            }
        );
    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error during Google authentication"
        });
    }
};

module.exports = {
    googleAuth
};
