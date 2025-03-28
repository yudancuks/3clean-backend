const express = require('express');
const router = express.Router();
const detailPackageController = require('../controllers/detailPackageController');

// Detail Package routes
router.get('/all', detailPackageController.getAllDetailPackages);
router.get('/:id', detailPackageController.getDetailPackageById);
router.post('/:packageId/', detailPackageController.addDetailPackage);
router.put('/:id', detailPackageController.updateDetailPackage);
router.delete('/:id', detailPackageController.deleteDetailPackage);

module.exports = router;
