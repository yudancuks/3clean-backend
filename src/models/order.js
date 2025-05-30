const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Order Schema
const orderSchema = new Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
  },
  scheduleDate: { 
    type: Date, 
    required: true 
  },
  scheduleTime: { 
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'on-progress', 'succeed'],
    default: 'pending'
  },
  orderDetails: {
    customer: {
      firstname: { type: String, required: true },
      lastname: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    package: {
      name: { type: String, required: true },
      detailPackage: {
        description: { type: Schema.Types.ObjectId, ref: 'DetailPackage'},  // Optional, description for detail packages
      },
    },
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      }
    ],
    totalPrice: { type: Number, default: 0 },  // Store the calculated total price
  },
  invoicePath: { type: String }, // Add invoice path field
}, { 
  timestamps: true,
});


// Export the model
module.exports = mongoose.model('Order', orderSchema);
