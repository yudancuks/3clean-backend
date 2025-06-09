// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/customer');
const mongoose = require('mongoose');

// Controller function for login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, fullname: user.fullname},
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.cookie('token', token, {
      httpOnly: true,      // aman dari JS client
      secure: false,       // true kalau pakai HTTPS
      sameSite: 'lax',     // atau 'none' kalau domain beda dan pakai HTTPS
      maxAge: 3 * 60 * 60 * 1000,
    });
    
    res.status(200).json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, address, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Buat customer baru
    const newCustomer = new User({
      firstname,
      lastname,
      email,
      phone,
      address,
      password, // akan di-hash oleh pre('save') hook
    });

    await newCustomer.save();

    // (Opsional) Jangan kirim password ke response
    const { password: _, ...customerData } = newCustomer.toObject();

    res.status(201).json({
      message: 'Registrasi berhasil.',
      customer: customerData,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi.' });
  }
};

// controllers/orderController.js

const Order = require('../models/order');
const Package = require('../models/detailPackage');

exports.getOrdersByToken = async (req, res) => {
  try {
    const email = req.user.email;

    if (!email) {
      return res.status(400).json({ message: 'Email tidak ditemukan dalam token.' });
    }

    const orders = await Order.find({ 'orderDetails.customer.email': email }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Tidak ada order ditemukan untuk email ini.' });
    }

    const newOrders = await Promise.all(orders.map(async (order) => {
      // Ambil package detail dengan ObjectId dari description
      const packageId = order.orderDetails.package.detailPackage.description;
      const packageDetail = await Package.findOne({ _id: new mongoose.Types.ObjectId(packageId) });

      const { orderDetails } = order;
      const packagePrice = packageDetail?.totalPrice || 0;
      const addOnsPrice = orderDetails.addOns?.reduce((sum, addOn) => sum + (addOn.price || 0), 0) || 0;

      // Update total price
      orderDetails.totalPrice = packagePrice + addOnsPrice;

      return {
        ...order.toObject(),
        orderDetails: {
          ...order.orderDetails,
          package: {
            ...order.orderDetails.package,
            detailPackage: packageDetail,
          }
        }
      };
    }));

    res.status(200).json(newOrders);
  } catch (error) {
    console.error('Error getOrdersByToken:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil order.' });
  }
};
