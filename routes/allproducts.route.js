const express = require('express');
const {check} = require('express-validator');   
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');
const checkBanned = require('../middleware/checkBanned.js');

const {getAllProducts, product, createProduct, getFeaturedProducts} = require('../controllers/products.controller.js');

const productRouter = express.Router();

productRouter.get('/', getAllProducts);
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/:id', product);
productRouter.post('/', auth, checkBanned, [
    check('name').notEmpty().withMessage('Product name is required'),
    check('description').notEmpty().withMessage('Description is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('category').notEmpty().withMessage('Category is required'),
    check('location').notEmpty().withMessage('Location is required'),
], createProduct);

module.exports = productRouter;