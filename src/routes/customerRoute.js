// routes/customerRoute.js
const express = require('express');
const router = express.Router();
const authCustomer = require('../controllers/authCustomer');
const { authenticate } = require('../middleware/auth');

// Define the login route
router.post('/customer/login', authCustomer.login);

router.post('/customer/register', authCustomer.register);

router.get('/my-orders', authenticate, authCustomer.getOrdersByToken);

module.exports = router;
