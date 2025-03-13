const express = require('express');
// const cors = require('cors');
const routes = require('./routes');
const { checkS3Connection } = require('./config/S3-config');
const { connectDB } = require('./config/database');

const app = express();

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});


app.use('/api', routes);

const PORT = process.env.PORT || 4000;
const Redis = require('ioredis');

// const redis = new Redis('redis://127.0.0.1:6379');

// redis.on('connect', () => {
//   console.log('Connected to Redis');
// });

// redis.on('error', (err) => {
//   console.error('Redis error:', err);
// });




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// ✅ Ensure Both DB and S3 Work Before Starting Server
Promise.all([connectDB() ,checkS3Connection()])
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
  