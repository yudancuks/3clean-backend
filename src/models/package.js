// models/package.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DetailPackage = require('./detailPackage'); // Import the DetailPackage model

// Define the main Package schema
const packageSchema = new Schema({
  name: { type: String, required: true },
  packageId: { type: String, required: true, unique: true },
  packageType: { type: String, enum: ['first', 'second'], required: true },
  totalPrice: { type: Number, required: function() { return this.packageType === 'first'; }},
  detailPackage: { 
    type: [Schema.Types.ObjectId], // Store an array of references to DetailPackage
    ref: 'DetailPackage',
    default: [] // Default to an empty array if no detailPackages are provided
  },
});

// Create the model
const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
