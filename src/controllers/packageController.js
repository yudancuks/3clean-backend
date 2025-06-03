const Package = require('../models/package');
const DetailPackage = require('../models/detailPackage');
const { getCache, setCache, clearCache } = require('../utils/redisCache');

const mongoose = require('mongoose');

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all packages (with Redis caching)
exports.getPackages = async (req, res) => {
  const cacheKey = 'packages:all';
  try {
    const packages = await Package.find().populate({
      path: 'detailPackages',
      strictPopulate: false 
    });

    if (!packages.length) {
      return res.status(404).json({ message: 'No packages found' });
    }

    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
};

// Get a package by ID (ensuring details are included even if empty)
exports.getPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const packageData = await Package.findById(id).populate({
      path: 'detailPackages',
      select: 'name totalPrice',
      strictPopulate: false
    });

    if (!packageData) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json(packageData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package', error: error.message });
  }
};

// Update package by ID

exports.updatePackageById = async (req, res) => {
  const { id } = req.params;
  const { name, packageId, totalPrice } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }

    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if packageId already exists in another document
    if (packageId && packageId !== existingPackage.packageId) {
      const duplicatePackage = await Package.findOne({ packageId });
      if (duplicatePackage) {
        return res.status(400).json({ message: 'Package ID already exists' });
      }
      existingPackage.packageId = packageId;
    }

    if (name) existingPackage.name = name;

    if (totalPrice) existingPackage.totalPrice = totalPrice;

    await existingPackage.save();

    // Clear cache
    await clearCache(`package:${id}`);
    await clearCache('packages:all');

    res.status(200).json(existingPackage);
  } catch (error) {
    res.status(500).json({ message: 'Error updating package', error: error.message });
  }
};

// Delete package by ID
exports.deletePackageById = async (req, res) => {
  const { id } = req.params;

  try {
    // Cek total package
    const totalPackages = await Package.countDocuments();
    if (totalPackages <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last remaining package' });
    }

    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

