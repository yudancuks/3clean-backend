const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AddOn = require('../models/addOn');
const Package = require('../models/package');
const Admin = require('../models/user'); 

dotenv.config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

const seedAddOns = async () => {
  try {
    await AddOn.deleteMany(); // Clear existing data
    console.log('Existing addOns removed');

    const addOns = [
      { name: 'Patio', totalPrice: 20 },
      { name: 'Deck', totalPrice: 20 },
      { name: 'Large Balcony', totalPrice: 50 },
      { name: 'Small Balcony', totalPrice: 20 },
      { name: 'Carpet Steam Clean (per room or area)', totalPrice: 25 },
      { name: 'Wet Wipe Blinds (per blind)', totalPrice: 10 },
      { name: 'Exterior Windows (levelled house only)', totalPrice: 50 },
      { name: 'Garage Sweep & Tidy', totalPrice: 20 },
      { name: 'Spot Clean Walls (15 Minutes)', totalPrice: 20 },
      { name: 'Spot Clean Walls (30 Minutes)', totalPrice: 30 },
      { name: 'Spot Clean Walls (1 Hour)', totalPrice: 50 },
      { name: 'End of Lease Flea Treatment (pest control)', totalPrice: 130 },
    ];

    await AddOn.insertMany(addOns);
    console.log('AddOns seeded successfully');
  } catch (err) {
    console.error('Error seeding AddOns:', err);
  }
};

const seedPackages = async () => {
  try {
    await Package.deleteMany(); // Clear existing data
    console.log('Existing packages removed');

    const packages = [
      { name: 'House Cleaning', packageType: "second", packageId: "HC001" },
      { name: 'Deep Cleaning', packageType: "second", packageId: "DC001" },
      { name: 'End Of Lease Cleaning', packageType: "second", packageId: "EC001" },
      { name: 'Regular Cleaning', packageType: "second", packageId: "RC001" },
      { name: 'Carpet Cleaning', packageType: "second", packageId: "CC001" },
      { name: 'Mattress Cleaning', packageType: "second", packageId: "MC001" },
      { name: 'Rug Cleaning', packageType: "second", packageId: "RC002" },
      { name: 'Upholstery Cleaning', packageType: "second", packageId: "UC001" },
    ];

    await Package.insertMany(packages);
    console.log('Packages seeded successfully');
  } catch (err) {
    console.error('Error seeding Packages:', err);
  }
};

const seedAdmins = async () => {
  try {
    await Admin.deleteMany(); // Clear existing data
    console.log('Existing admin removed');

    const admins = [
      { fullName: 'Admin 3Clean', emailAddress: "3cleanadmin@mail.com", password: "12345678" },
    ];

    await Admin.insertMany(admins);
    console.log('Admins seeded successfully');
  } catch (err) {
    console.error('Error seeding Admins:', err);
  }
};

const seedData = async () => {
  try {
    await seedAddOns();
    await seedPackages();
    await seedAdmins();
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
  }
};

seedData();
