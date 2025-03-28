const express = require('express');
const router = express.Router();
const { generateInvoice, getInvoice, createInvoice } = require('../controllers/invoiceController');

router.get('/create/:orderId', generateInvoice);
router.get('/download/:orderId', getInvoice);
router.get('/generate/:orderId', createInvoice);


module.exports = router;
