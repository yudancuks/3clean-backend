// models/customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model('Customer', customerSchema);