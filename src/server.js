// server.js
const express = require('express');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoute.js');
const authRoutes = require('./routes/authRoute.js');
const packageRoute = require('./routes/packageRoute.js');
const detailPackageRoute = require('./routes/detailPackageRoute.js');
const addOnRoute = require('./routes/addOnRoute.js');
const orderRoute = require('./routes/orderRoute.js');
const invoiceRoute = require('./routes/invoiceRoute.js');
const cleanerRoute = require('./routes/procleanRoute.js');

require('dotenv').config();
const path = require('path');
const cors = require('cors');
const { DetailPackage } = require('./models/detailPackage.js');

const app = express();

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Middleware JSON
app.use(express.json());

// Enable CORS for requests from https://3cleaningsydney.com/:5000
app.use(cors({ origin: '*' }));

// Middleware form-urlencoded
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;


// Connect to database
connectDB();


// Routes CMS
app.use('/api', userRoutes);
app.use('/api/packages', packageRoute);
app.use('/api/packages/detail', detailPackageRoute);
app.use('/api/addOns', addOnRoute);
app.use('/api/orders', orderRoute);
app.use('/api/invoice', invoiceRoute);
app.use('/api', cleanerRoute);
app.use('/api', authRoutes); // Generate token mockup


// Routes Landing Pages



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
