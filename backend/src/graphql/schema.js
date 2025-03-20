const { gql } = require("apollo-server-express");

const typeDefs = gql`
type Subject {
  _id: ID!
  name: String!
  description: String
  createdAt: String!
}

  type Diagram {
    id: ID!
    image_url: String!
    filename: String!
    upload_date: String!
    title: String!
    subjectId: Subject
    diagramTypeId: String!
    sourceType: String!
    pageNumber: Int
    author: String
    notes: String
    subjects: [String]
    category: String!
    sub_category: String
    tags: [String]

    file_info: FileInfo
    mathematical_expressions: [MathExpression]
    extracted_symbols: [ExtractedSymbol]
    color_analysis: ColorAnalysis
    quality_scores: QualityScores
    quality_rating: String
    extracted_text: String
    related_diagrams: [Diagram]
    searchable_text: String
    created_at: String!
  }

  # File Metadata
  type FileInfo {
    file_size_mb: Float!
    format: String!
    resolution: String!
    dimensions: Dimensions!
  }

  type Dimensions {
    width: Int!
    height: Int!
    megapixels: Float!
  }

  # Extracted Math Expressions
  type MathExpression {
    expression: String
  }

  # Extracted Symbols
  type ExtractedSymbol {
    symbol: String
  }

  # Color Analysis
  type ColorAnalysis {
    dominant_colors: [[Int]]
    color_distribution: ColorDistribution
  }

  type ColorDistribution {
    mean_rgb: [Int]!
    mean_hsv: [Int]!
    mean_lab: [Int]!
    std_rgb: [Int]!
  }

  # Quality Analysis
  type QualityScores {
    overall_quality: Int!
    blur_score: Int!
    brightness_score: Int!
    contrast_score: Int!
    detail_score: Int!
    edge_density: Int!
    noise_level: Int!
    sharpness: Int!
  }

  # Pagination Response
  type DiagramPagination {
    diagrams: [Diagram]
    total: Int
    totalPages: Int
    currentPage: Int
  }

  # Input Type for Adding a Diagram
  input AddDiagramInput {
    image_url: String!
    filename: String!
    title: String!
    subjectId: String!
    diagramTypeId: String!
    sourceType: String!
    pageNumber: Int
    author: String
    notes: String
    subjects: [String]
    category: String!
    sub_category: String
    tags: [String]
  }

  type Query {
    getAllDiagrams(page: Int, limit: Int): DiagramPagination
    getDiagramById(id: ID!): Diagram
    getAllDiagramsBySubjectType(page: Int, limit: Int): DiagramPagination
  }

  type Mutation {
    addDiagram(input: AddDiagramInput): Diagram
    deleteDiagram(id: ID!): String
  }
`;

module.exports = typeDefs;
