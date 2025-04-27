const mongoose = require("mongoose");

// ✅ Function to check DB connection on startup
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit the process if DB is not connected
  }
};

// 🛑 Graceful shutdown handling
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("⚠️ MongoDB disconnected due to app termination");
  process.exit(0);
});

module.exports = { connectDB };
