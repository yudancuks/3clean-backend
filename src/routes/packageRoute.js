const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// Package routes
router.post('/', packageController.createPackage);
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);
router.put('/:id', packageController.updatePackageById);
router.delete('/:id', packageController.deletePackageById);

module.exports = router;
