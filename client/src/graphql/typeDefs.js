const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Subject {
    _id: ID!
    name: String!
    description: String
  }

  type Dimensions {
    width: Int!
    height: Int!
    megapixels: Float!
  }

  type FileInfo {
    file_size_mb: Float!
    format: String!
    resolution: String!
    dimensions: Dimensions!
  }

  type ColorDistribution {
    mean_rgb: [Float!]!
    mean_hsv: [Float!]!
    mean_lab: [Float!]!
    std_rgb: [Float!]!
  }

  type ColorAnalysis {
    dominant_colors: [[Int!]!]!
    color_distribution: ColorDistribution!
  }

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

  type Diagram {
    _id: ID!
    image_url: String!
    filename: String!
    title: String!
    subjectId: Subject
    diagramTypeId: ID
    sub_category: String
    sourceType: String
    pageNumber: Int
    author: String
    notes: String
    subjects: [String!]
    tags: [String!]
    file_info: FileInfo
    extracted_symbols: [String!]
    color_analysis: ColorAnalysis
    quality_scores: QualityScores
    quality_rating: String
    extracted_text: String
    upload_date: String
    created_at: String!
  }

  type DiagramPagination {
    diagrams: [Diagram]
    total: Int
    totalPages: Int
    currentPage: Int
  }

  type Query {
    # Fetch all images (No filtering, just pagination)
    getAllDiagrams(page: Int, limit: Int): DiagramPagination
    
    # Fetch a single diagram by ID
    getDiagramById(id: ID!): Diagram
    
    # Fetch diagrams by subject type
    getAllDiagramsBySubjectType(subjectId: ID, page: Int, limit: Int): DiagramPagination
  }
`;

module.exports = typeDefs;