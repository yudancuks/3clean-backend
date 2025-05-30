const AddOn = require('../models/addOn');
const Package = require('../models/package');
const DetailPackage = require('../models/detailPackage');
const Order = require('../models/order'); 
const User = require('../models/user');
const Cleaner = require('../models/procleaner');

exports.getAllDashboardData = async (req, res) => {
  try {
    const addOnCount  = await AddOn.countDocuments();
    const packageCount  = await Package.countDocuments();
    const detailPackageCount  = await DetailPackage.countDocuments();

    const ordersCount = await Order.countDocuments();
    const ordersPendingCount = await Order.countDocuments({ status: 'pending' });
    const ordersOnProgressCount = await Order.countDocuments({ status: 'on-progress' });
    const ordersSuccedCount = await Order.countDocuments({ status: 'succeed' });

    const customersCount = (await Order.distinct('orderDetails.customer.email')).length;
    const adminsCount = await User.countDocuments();
    const cleanersCount = await Cleaner.countDocuments();

    const usersCount = customersCount+adminsCount+cleanersCount;


    res.status(200).json({
      addOnCount,
      packageCount,
      detailPackageCount,

      ordersCount,
      ordersPendingCount,
      ordersOnProgressCount,
      ordersSuccedCount,

      usersCount,
      customersCount,
      adminsCount,
      cleanersCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve AddOns', error: err.message });
  }
};