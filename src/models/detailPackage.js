// models/detailPackage.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailPackageSchema = new Schema({
  package: { type: Schema.Types.ObjectId, ref: 'Package'}, // Reference to Package model
  name:{ type: String, required:true},
  totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model('DetailPackage', detailPackageSchema);
