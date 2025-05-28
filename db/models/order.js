const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            price: Number,
            rentalDuration: {
                type: String,
                enum: ['hours', 'days', 'weeks', 'months'],
                default: 'days'
            },
            quantity: {
                type: Number,
                default: 1
            },
            rentalPeriod: Number // Number of rental units (e.g., 3 days)
        }
    ],
    address: {
        type: Object,
        required: true,
        properties: {
            label: String,
            type: String,
            fullAddress: String,
            phone: String
        }
    },
    subtotal: Number,
    tax: Number,
    total: Number,
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'pending'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
