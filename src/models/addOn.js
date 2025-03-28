// models/addOn.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addOnSchema = new Schema({
  name: { type: String, required: true },
  totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model('AddOn', addOnSchema);