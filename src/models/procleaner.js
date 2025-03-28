// models/procleaner.js

const mongoose = require('mongoose');

const procleanerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob:{type:Date, required:true},
  hiredDate:{type:Date},
  address: { type: String, required: true },
});

module.exports = mongoose.model('Procleaner', procleanerSchema);