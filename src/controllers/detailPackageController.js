const DetailPackage = require('../models/detailPackage');
const Package = require('../models/package');
const { clearCache } = require('../utils/redisCache');

const mongoose = require('mongoose');

// Get all detail packages with optional filtering by packageId
exports.getAllDetailPackages = async (req, res) => {
  try {
    const { packageId, packageName } = req.query; // Ambil packageId dari query params
    const filter = packageName ? { name: packageName } : {}; // Buat filter jika ada packageId

    const packages = await Package.find(filter).populate({
      path: 'detailPackage',
      select: 'totalPrice name', // Hanya mengambil field yang dibutuhkan
    });

    // Transformasi data agar hanya mengembalikan detail packages dengan informasi package
    const detailPackages = packages.flatMap(pkg =>
      pkg.detailPackage.map(detail => ({
        ...detail.toObject(),
        packageName: pkg.name,
        packageType: pkg.packageType,
        serviceId: pkg._id,
      }))
    );

    res.status(200).json(detailPackages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching detail packages', error: error.message });
  }
};


// Get a detail package by its ID
exports.getDetailPackageById = async (req, res) => {
  const { id } = req.params;  // Extract the detail package ID from URL parameters
  console.log(`Received ID: ${id}`);
  try {
    // Ensure the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid detail package ID format' });
    }

    // Find the detail package by its ID
    const detailPackage = await DetailPackage.findById(id);
    if (!detailPackage) {
      return res.status(404).json({ message: 'Detail package not found' });
    }

    // Return the found detail package
    res.status(200).json(detailPackage);
  } catch (error) {
    console.error('Error getting detail package:', error);
    res.status(500).json({ message: 'Error retrieving detail package', error: error.message });
  }
};

// Add a new detail package to a package
exports.addDetailPackage = async (req, res) => {
  const { packageId } = req.params;  // Extract packageId from URL
  const {totalPrice, name } = req.body;

  try {
    // Ensure packageId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }

    // Find the package by ID
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Create a new DetailPackage
    const detailPackage = new DetailPackage({
      name,
      totalPrice
    });

    // Save the detail package
    await detailPackage.save();

    // Add the new DetailPackage reference to the package's detailPackage array
    if (package && Array.isArray(package.detailPackage)) {
      package.detailPackage.push(detailPackage._id);
    } else {
      // Initialize the detailPackage array if it's null or undefined
      package.detailPackage = [detailPackage._id];
    }

    // Save the updated package
    await package.save();

    // Optionally, fetch the updated package to return the full data
    const updatedPackage = await Package.findById(packageId).populate('detailPackage');

    res.status(201).json({ message: 'Detail package added', package: updatedPackage });
  } catch (error) {
    console.error('Error adding detail package:', error);
    res.status(500).json({ message: 'Error adding detail package', error: error.message });
  }
};

// Update a detail package
exports.updateDetailPackage = async (req, res) => {
  const { id } = req.params;
  const {totalPrice, name } = req.body;

  try {
    const detailPackage = await DetailPackage.findByIdAndUpdate(id, {name, totalPrice }, { new: true, runValidators: true });

    if (!detailPackage) {
      return res.status(404).json({ message: 'Detail Package not found' });
    }

    await clearCache(`package:${detailPackage.packageId}`);
    await clearCache('packages:all');

    res.status(200).json(detailPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a detail package
exports.deleteDetailPackage = async (req, res) => {
  const { id } = req.params;

  try {
    // Cek total detail package
    const totalDetails = await DetailPackage.countDocuments();
    if (totalDetails <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last remaining detail package' });
    }

    const detailPackage = await DetailPackage.findByIdAndDelete(id);
    if (!detailPackage) {
      return res.status(404).json({ message: 'Detail Package not found' });
    }

    await clearCache(`package:${detailPackage.packageId}`);
    await clearCache('packages:all');

    res.status(200).json({ message: 'Detail Package deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

