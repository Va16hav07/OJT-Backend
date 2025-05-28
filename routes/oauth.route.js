const express = require('express');
const { googleAuth } = require('../controllers/oauth.controller.js');

const oauthRouter = express.Router();

// Google OAuth route
oauthRouter.post('/google', googleAuth);

module.exports = oauthRouter;
