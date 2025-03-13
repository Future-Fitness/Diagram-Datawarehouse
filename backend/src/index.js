const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { checkS3Connection } = require("./config/S3-config");
const { connectDB } = require("./config/database");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const Redis = require("ioredis");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Route Health Check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// ✅ Express Routes
app.use("/api", routes);

// ✅ Redis Connection
// const redis = new Redis("redis://127.0.0.1:6379");

// redis.on("connect", () => {
//   console.log("✅ Connected to Redis");
// });

// redis.on("error", (err) => {
//   console.error("❌ Redis error:", err);
// });

// ✅ Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});



// ✅ Start Express & Apollo Server
async function startServer() {
  try {
    await connectDB();
    await checkS3Connection();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true, // ✅ Enables GraphQL Playground
      playground: true,    // ✅ Allows testing queries
    });

    await server.start(); // ✅ Ensure server starts first
    server.applyMiddleware({ app }); // ✅ Apply GraphQL middleware


    app.listen(PORT, () => 
      console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Start Server

// ✅ 404 Route Not Found
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// ✅ Start Server
startServer();
