const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get all AddOns
router.get('/', dashboardController.getAllDashboardData);

module.exports = router;