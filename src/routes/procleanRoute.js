// /routes/procleanRoute.js

const express = require('express');
const procleanController = require('../controllers/procleanerController.js');
const authenticateJWT = require('../middleware/auth.js');

const router = express.Router();

router.post('/cleaner', procleanController.createUser);
router.get('/cleaner', procleanController.getUser);
router.get('/cleaner/:id', procleanController.getUserByIdentityNumber);
router.put('/cleaner/:id', procleanController.updateById);
router.delete('/cleaner/:id', procleanController.deleteUserById);


module.exports = router;
