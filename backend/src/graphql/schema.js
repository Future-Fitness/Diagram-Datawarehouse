const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Subject {
    _id: ID!
    name: String!
    description: String
    diagrams: [Diagram!]!
    createdAt: String!
  }

  type DiagramPage {
  diagrams: [Diagram!]!
  total: Int!
  totalPages: Int!
  currentPage: Int!
}

  type Diagram {
    _id: ID!
    image_url: String!
    filename: String!
    title: String!
    subjectId: Subject
    diagramTypeId: String
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
  overall_quality: Float!
  blur_score: Float!
  brightness_score: Float!
  contrast_score: Float!
  detail_score: Float!
  edge_density: Float!
  noise_level: Float!
  sharpness: Float!
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
    subjectId: ID # ✅ Changed to ID type
    diagramTypeId: ID # ✅ Changed to ID type
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
    getDiagramById(id: ID): Diagram
    getAllDiagramsBySubjectType(subjectId: ID, page: Int, limit: Int): DiagramPagination 
    searchDiagrams(
    query: String
    subjectId: ID
    minQualityScore: Int
    page: Int
    limit: Int  ): DiagramPage!
  }


`;

module.exports = typeDefs;
