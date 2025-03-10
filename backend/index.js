const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));



// ✅ Ensure Both DB and S3 Work Before Starting Server
Promise.all([ checkS3Connection()])
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
  
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});



// API Routes
const apiRoutes = require('./routes/api');
const { connectDB } = require('./src/config/database');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

