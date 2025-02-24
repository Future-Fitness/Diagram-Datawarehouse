const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Function to check DB connection on startup
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to AWS RDS PostgreSQL");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit the process if DB is not connected
  }
};

// 🛑 Graceful shutdown handling
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("⚠️ Prisma disconnected due to app termination");
  process.exit(0);
});

module.exports = { prisma, connectDB };
