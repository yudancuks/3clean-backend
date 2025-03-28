const express = require('express');
const router = express.Router();
const addOnController = require('../controllers/addOnController');

// Get all AddOns
router.get('/', addOnController.getAllAddOns);

// Get AddOn by ID
router.get('/:id', addOnController.getAddOnById);

// Create a new AddOn
router.post('/', addOnController.createAddOn);

// Update AddOn by ID
router.put('/:id', addOnController.updateAddOn);

// Delete AddOn by ID
router.delete('/:id', addOnController.deleteAddOn);

module.exports = router;
