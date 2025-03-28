const AddOn = require('../models/addOn');

// Get all AddOns
exports.getAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOn.find();
    res.status(200).json(addOns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve AddOns', error: err.message });
  }
};

// Get AddOn by ID
exports.getAddOnById = async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
      return res.status(404).json({ message: 'AddOn not found' });
    }
    res.status(200).json(addOn);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving AddOn', error: err.message });
  }
};

// Create a new AddOn
exports.createAddOn = async (req, res) => {
  const { name, totalPrice } = req.body;

  if (!name || !totalPrice) {
    return res.status(400).json({ message: 'Name and totalPrice are required' });
  }

  try {
    const newAddOn = new AddOn({ name, totalPrice });
    await newAddOn.save();
    res.status(201).json(newAddOn);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create AddOn', error: err.message });
  }
};

// Update an AddOn by ID
exports.updateAddOn = async (req, res) => {
  const { name, totalPrice } = req.body;

  if (!name || !totalPrice) {
    return res.status(400).json({ message: 'Name and totalPrice are required' });
  }

  try {
    const updatedAddOn = await AddOn.findByIdAndUpdate(
      req.params.id,
      { name, totalPrice },
      { new: true, runValidators: true }
    );

    if (!updatedAddOn) {
      return res.status(404).json({ message: 'AddOn not found' });
    }

    res.status(200).json(updatedAddOn);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update AddOn', error: err.message });
  }
};

// Delete an AddOn by ID
exports.deleteAddOn = async (req, res) => {
  try {
    const deletedAddOn = await AddOn.findByIdAndDelete(req.params.id);

    if (!deletedAddOn) {
      return res.status(404).json({ message: 'AddOn not found' });
    }

    res.status(200).json({ message: 'AddOn deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete AddOn', error: err.message });
  }
};
