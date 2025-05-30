const User = require('../models/user');
const Order = require('../models/order');
const { getCache, setCache, clearCache } = require('../utils/redisCache'); // Add clearCache function

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
exports.getUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by identity number with Redis caching
exports.getUserByIdentityNumber = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `id:${id}`;
  try {
    // Check Redis cache
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

    // If not in cache, fetch from MongoDB
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store fetched data in Redis
    await setCache(cacheKey, JSON.stringify(user), 3600); // Cache for 1 hour

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update User By Identity Number
exports.updateById = async (req, res) => {
  const { id } = req.params;
  const {fullName, emailAddress, password } = req.body;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {};
    if (fullName && fullName !== existingUser.fullName) updateFields.fullName = fullName;
    if (emailAddress && emailAddress !== existingUser.emailAddress) updateFields.emailAddress = emailAddress;
    if (password) updateFields.password = password; // Consider hashing before saving

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'Failed to update user' });
    }

    // Update Redis cache
    const cacheKey = `id:${id}`;
    await setCache(cacheKey, JSON.stringify(user), 3600);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete User By Identity Number
exports.deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from Redis cache
    const cacheKey = `id:${id}`;
    await clearCache(cacheKey);

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all customer
exports.getCustomer = async (req, res) => {
  try {
        // 1. Ambil semua orderDetails dengan customer di-populate (ambil email & nama)
    const orders = await Order.find({}, 'orderDetails')
      .populate('orderDetails.customer', 'email name')
      .lean();

    // 2. Gabungkan semua orderDetails dari semua order menjadi array tunggal
    const allOrderDetails = orders.flatMap(order => order.orderDetails);

    // 3. Filter supaya hanya satu orderDetails per customer.email
    const uniqueByEmail = [];
    const seenEmails = new Set();

    for (const od of allOrderDetails) {
      const email = od.customer?.email;  // pastikan customer dan email ada
      if (email && !seenEmails.has(email)) {
        seenEmails.add(email);
        uniqueByEmail.push(od);
      }
    }

    res.status(200).json(uniqueByEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


