const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { checkS3Connection } = require("./config/S3-config");
const { connectDB } = require("./config/database");
// Apollo and GraphQL imports
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const app = express();
const PORT = process.env.PORT || 4001;
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Route Health Check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

// Express Routes
app.use("/api", routes);

// Only start external services if NOT in test mode


if (process.env.NODE_ENV !== "integration" && require.main === module) {
  (async () => {
    try {
      await connectDB();
      await checkS3Connection();
      
      const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        playground: true,
      });
    
      await server.start();
      server.applyMiddleware({ app, cors: { origin: "*", credentials: true } });
    
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
      });
    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  })();
}

module.exports = { app };