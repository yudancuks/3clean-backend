const User = require('../models/procleaner');
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
  const {firstname, lastname, email, phone, dob, hiredDate, address  } = req.body;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {};
    if (firstname && firstname !== existingUser.firstname) updateFields.firstname = firstname;
    if (lastname && lastname !== existingUser.lastname) updateFields.lastname = lastname;
    if (email && email !== existingUser.email) updateFields.email = email;
    if (dob && dob !== existingUser.dob) updateFields.dob = dob;
    if (phone && phone !== existingUser.phone) updateFields.phone = phone;
    if (hiredDate && hiredDate !== existingUser.hiredDate) updateFields.hiredDate = hiredDate;
    if (address && address !== existingUser.address) updateFields.address = address;
    
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
    // Cek total user
    const totalUsers = await User.countDocuments();
    if (totalUsers <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last remaining cleaner' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Cleaner not found' });
    }

    // Remove from Redis cache
    const cacheKey = `id:${id}`;
    await clearCache(cacheKey);

    res.status(200).json({ message: 'Cleaner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

