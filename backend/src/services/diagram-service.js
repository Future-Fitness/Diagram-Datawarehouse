const diagramType = require("../models/DiagramType");
// Ensure these are imported or defined appropriately:
const { connectDB } = require("../config/database");
const { checkS3Connection } = require("../config/S3-config");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const cors = require("cors");
const typeDefs = require("../graphql/schema");
const resolvers = require("../graphql/resolvers");

const app = express();
const PORT = process.env.PORT || 4000;

async function createDiagramType(name, description, category) {
  try {
    const Diagram = { name, description, category };
    console.log(Diagram);
    const newDiagram = await diagramType.create(Diagram);
    return newDiagram;
  } catch (error) {
    console.log(error);
    throw new Error("Error in creating Diagram Type");
  }
}

async function getAllDiagramsType() {
  try {
    const diagrams = await diagramType.find({});
    return diagrams;
  } catch (error) {
    console.log(error);
    throw new Error("Error in getting Diagram Type");
  }
}

async function startServer() {
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

    const serverInstance = app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`)
    );

    return serverInstance;
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Only start the server if this module is run directly, not when imported in tests
if (require.main === module) {
  startServer();
}

module.exports = {
  createDiagramType,
  getAllDiagramsType,
  app,
  startServer,
};