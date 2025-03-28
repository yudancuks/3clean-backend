// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the login route
router.post('/auth/login', authController.login);

module.exports = router;
