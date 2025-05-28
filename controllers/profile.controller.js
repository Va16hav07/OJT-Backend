const User = require('../db/models/user');
const Order = require('../db/models/order');

const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching profile for user:', userId);

        // Get user data including address
        const user = await User.findById(userId).select('-password');
        console.log('Found user:', user);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's orders using userId field
        const orders = await Order.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('products.productId'); // Update to use productId instead of product
        console.log('Found orders:', orders);

        // Combine all data
        const profileData = {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                type: user.type,
                createdAt: user.createdAt,
                addresses: user.addresses || []
            },
            orders: orders.map(order => ({
                _id: order._id,
                status: order.status,
                total: order.total,
                products: order.products.map(product => ({
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    rentalDuration: product.rentalDuration,
                    rentalPeriod: product.rentalPeriod
                })),
                createdAt: order.createdAt,
                address: order.address
            }))
        };

        console.log('Sending profile data:', profileData);
        res.json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile data' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body;

        // Validate input
        if (!name && !phone) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Update user data
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                type: updatedUser.type
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { label, type, address, phone } = req.body;

        // Validate required fields
        if (!label || !address || !phone) {
            return res.status(400).json({ message: 'Label, address, and phone are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new address
        const newAddress = {
            label,
            type: type || 'Home',
            address,
            phone
        };

        // Add to addresses array
        user.addresses.push(newAddress);
        await user.save();

        res.json({
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Error adding address' });
    }
};

const editAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const { label, type, address, phone } = req.body;

        // Validate required fields
        if (!label || !address || !phone) {
            return res.status(400).json({ message: 'Label, address, and phone are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find and update the address
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Update address fields
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            label,
            type: type || user.addresses[addressIndex].type,
            address,
            phone
        };

        await user.save();

        res.json({
            message: 'Address updated successfully',
            addresses: user.addresses
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Error updating address' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the address
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();

        res.json({
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Error deleting address' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    addAddress,
    editAddress,
    deleteAddress
}; 