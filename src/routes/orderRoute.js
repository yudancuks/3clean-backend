// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); 

const generateOrderIdMiddleware = require('../middleware/generateOrderId');

// Routes for CRUD operations
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', generateOrderIdMiddleware, orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
