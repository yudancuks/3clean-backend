const Order = require('../models/order');  // Adjust path if needed
const Package = require('../models/detailPackage');  // Adjust path if needed
const mongoose = require('mongoose');
// Controller for creating an order
exports.createOrder = async (req, res) => {
  try {
    const { scheduleDate, scheduleTime, orderDetails } = req.body;

    // Validation check
    if (!scheduleDate || !orderDetails || !orderDetails.customer || !orderDetails.package) {
      return res.status(400).json({ message: 'Missing required fields in orderDetails' });
    }

    // Ensure customer exists by referencing the customer (do not create a new one)
    const customer = orderDetails.customer; // You should be passing customer ID directly
    const package = orderDetails.package;
    const addOns = orderDetails.addOns;
    // Create the order using the orderId from middleware
    const order = new Order({
      orderId: req.body.orderId,
      scheduleDate,
      scheduleTime,
      orderDetails: {
        package,
        customer, // Using the customer ID directly
        addOns
      },
    });

    // Save the order
    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const newOrders = await Promise.all(orders.map(async (order) => {
      const packageDetail = await Package.findOne({ _id: new mongoose.Types.ObjectId(order.orderDetails.package.detailPackage.description) });
      const { orderDetails } = order;
        const packagePrice = packageDetail.totalPrice || 0;
        const addOnsPrice = orderDetails.addOns?.reduce((sum, addOn) => sum + (addOn.price || 0), 0) || 0;

        // Update total price
        orderDetails.totalPrice = packagePrice + addOnsPrice;
      return {
          ...order.toObject(), // Konversi dari Mongoose Document ke Object
          orderDetails: {
              ...order.orderDetails,
              package: {
                  ...order.orderDetails.package,
                  detailPackage: packageDetail, // Mengganti detailPackage dengan package baru
              }
          }
      };
  }));
    res.status(200).json(newOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Order
exports.updateOrder = async (req, res) => {
  try {
    const { scheduleDate, orderDetails } = req.body;

    // Find the order by ID
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields only if provided in the request
    if (scheduleDate) order.scheduleDate = scheduleDate;
    if (orderDetails) {
      if (orderDetails.customer) order.orderDetails.customer = orderDetails.customer;
      if (orderDetails.package) order.orderDetails.package = orderDetails.package;
      if (orderDetails.addOns) order.orderDetails.addOns = orderDetails.addOns;
    }

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatusOrder = async (req, res) => {
  try {
    const order_id = req.params.id; // ambil dari URL param
    const {status} = req.body;

    if (!order_id || !status) {
      return res.status(400).json({ message: 'order_id and status are required' });
    }

    // Validasi status yang diperbolehkan
    const allowedStatuses = ['pending', 'on-progress', 'succeed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Cari order berdasarkan ID
    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.status = status;

    await order.save();

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

