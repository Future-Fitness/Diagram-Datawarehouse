const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Diagram {
    id: ID!
    image_url: String!
    title: String!
    created_at: String!
  }

  type DiagramPagination {
    diagrams: [Diagram]
    total: Int
    totalPages: Int
    currentPage: Int
  }

  type Query {
    # ✅ Fetch all images (No filtering, just pagination)
    getAllDiagrams(page: Int, limit: Int): DiagramPagination
    getDiagramById(id: ID!): Diagram
  }
`;

module.exports = typeDefs;
