// middlewares/orderMiddleware.js
const crypto = require('crypto');
const Order = require('../models/order'); 

// Function to generate a random 7-character string
const generateRandomOrderId = () => {
  return crypto.randomBytes(4).toString('hex'); 
};

// Middleware to generate unique orderId
const generateOrderIdMiddleware = async (req, res, next) => {
  try {
    let uniqueOrderId;
    while (true) {
      uniqueOrderId = generateRandomOrderId();
      const orderExists = await Order.findOne({ orderId: uniqueOrderId });
      if (!orderExists) break;
    }

    req.body.orderId = uniqueOrderId;
    console.log(`Generated orderId: ${req.body.orderId}`);  

    next();
  } catch (error) {
    console.error('Error generating orderId:', error);
    return next(error);
  }
};

module.exports = generateOrderIdMiddleware;
