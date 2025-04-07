import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ApiDocumentation = () => {
  // State for active tabs
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCodeTab, setActiveCodeTab] = useState('javascript');

  // Function to handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Helper function to determine tab styles
  const getTabStyles = (tab) => {
    return activeTab === tab
      ? "bg-blue-500 text-white px-4 py-2 rounded-t-lg"
      : "bg-gray-200 text-gray-700 px-4 py-2 rounded-t-lg hover:bg-gray-300";
  };

  // Helper function for code tab styles
  const getCodeTabStyles = (tab) => {
    return activeCodeTab === tab 
      ? "text-blue-500 border-b-2 border-blue-500" 
      : "text-gray-500 hover:text-gray-700";
  };

  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">

      <div
        onClick={() => navigate(-1)} // Navigate back to the previous page
        className="bg-blue-500 absolute top-4 left-4 p-2 text-white font-bold rounded cursor-pointer hover:bg-blue-600"
      >
        Back
      </div>
      <div className="mb-8 mt-10">
        <h1 className="text-3xl font-bold mb-2">Diagram API Documentation</h1>
        <p className="text-lg text-gray-600">
          Complete reference guide for interacting with the Diagram Analysis API
        </p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={getTabStyles('overview')}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={getTabStyles('image')}
          onClick={() => handleTabChange('image')}
        >
          Image API
        </button>
        <button 
          className={getTabStyles('diagram')}
          onClick={() => handleTabChange('diagram')}
        >
          Diagram API
        </button>
        <button 
          className={getTabStyles('search')}
          onClick={() => handleTabChange('search')}
        >
          Search API
        </button>
        <button 
          className={getTabStyles('graphql')}
          onClick={() => handleTabChange('graphql')}
        >
          GraphQL API
        </button>
      </div>
      
      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">API Overview</h2>
          <p className="text-gray-600 mb-4">
            The Diagram Analysis API provides endpoints for managing diagram uploads, analysis, searching, and metadata.
          </p>
          
          <h3 className="text-lg font-medium mt-6">Base URL</h3>
          <div className="bg-gray-100 p-2 rounded block">
            <code>{ 'http://localhost:4000/api'}</code>
          </div>
          
          <h3 className="text-lg font-medium mt-6">API Categories</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Image API</strong>: Upload and analyze diagram images</li>
            <li><strong>Diagram API</strong>: CRUD operations for diagram metadata</li>
            <li><strong>Search API</strong>: Search and find diagrams with various filters</li>
            <li><strong>GraphQL API</strong>: Alternative GraphQL interface for complex queries</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6">Response Format</h3>
          <p>All responses are returned in JSON format with the following structure:</p>
          <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "success": true|false,
  "message": "Description of the result",
  "data": { /* Response data object */ }
}`}
          </pre>
          
          <h3 className="text-lg font-medium mt-6">Error Handling</h3>
          <p>Error responses include additional details:</p>
          <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}`}
          </pre>
        </div>
      )}
      
      {/* Image API Content */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Image API</h2>
            <p className="text-gray-600 mb-6">
              Upload and process diagram images for analysis
            </p>
            
            {/* Endpoint: POST /v1/analyze */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">POST</span>
                <span className="font-mono">/v1/analyze</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Upload and analyze a diagram image. The image will be processed to extract text, symbols, and quality metrics.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Request</h3>
                <p className="mb-2">Content-Type: multipart/form-data</p>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-4 border">Parameter</th>
                      <th className="text-left py-2 px-4 border">Type</th>
                      <th className="text-left py-2 px-4 border">Required</th>
                      <th className="text-left py-2 px-4 border">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border">image</td>
                      <td className="py-2 px-4 border">File</td>
                      <td className="py-2 px-4 border">Yes</td>
                      <td className="py-2 px-4 border">The diagram image to analyze (jpg, png, etc.)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">title</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">Yes</td>
                      <td className="py-2 px-4 border">Title of the diagram</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">subjectId</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">Yes</td>
                      <td className="py-2 px-4 border">MongoDB ID of the subject</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">diagramTypeId</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">Yes</td>
                      <td className="py-2 px-4 border">MongoDB ID of the diagram type</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">sourceType</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">No</td>
                      <td className="py-2 px-4 border">Source of the diagram (default: "Unknown")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">tags</td>
                      <td className="py-2 px-4 border">Array</td>
                      <td className="py-2 px-4 border">No</td>
                      <td className="py-2 px-4 border">Tags for categorizing the diagram</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "success": true,
  "message": "Image uploaded and queued for analysis",
  "data": {
    "diagramId": "61934ec8b8e9a842e89f3c21",
    "imageUrl": "https://cdn.example.com/uploads/1234567890-image.jpg",
    "status": "pending",
    "processingMessage": "Your image is being analyzed. Check back in a few moments."
  }
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint: GET /v1/diagram/:id/status */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">GET</span>
                <span className="font-mono">/v1/diagram/:id/status</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Get the processing status of an uploaded diagram.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Path Parameters</h3>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-4 border">Parameter</th>
                      <th className="text-left py-2 px-4 border">Type</th>
                      <th className="text-left py-2 px-4 border">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border">id</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">MongoDB ID of the diagram</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "success": true,
  "status": "processing",
  "started": "2023-05-10T15:30:45.123Z",
  "completed": null,
  "error": null
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint: GET /v1/getAllImages */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">GET</span>
                <span className="font-mono">/v1/getAllImages</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Get all images from the database.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "success": true,
  "results": [
    {
      "_id": "61934ec8b8e9a842e89f3c21",
      "image_url": "https://cdn.example.com/uploads/image1.jpg",
      "title": "Circuit Diagram",
      // Other diagram properties
    },
    {
      "_id": "61934f12b8e9a842e89f3c22",
      "image_url": "https://cdn.example.com/uploads/image2.jpg",
      "title": "Flow Chart",
      // Other diagram properties
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Diagram API Content */}
      {activeTab === 'diagram' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Diagram Type & Subject API</h2>
            <p className="text-gray-600 mb-6">
              Manage diagram types and subject categories
            </p>
            
            {/* Endpoint: POST /v1/createDiagramType */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">POST</span>
                <span className="font-mono">/v1/createDiagramType</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Create a new diagram type.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Request Body</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "name": "Circuit Diagram",
  "description": "Diagrams showing electrical circuits and components",
  "category": "Electronics"
}`}
                </pre>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "message": "diagram created",
  "success": true,
  "subject": {
    "_id": "61934ec8b8e9a842e89f3c21",
    "name": "Circuit Diagram",
    "description": "Diagrams showing electrical circuits and components",
    "category": "Electronics",
    "created_at": "2023-05-10T15:30:45.123Z"
  }
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint: GET /v1/diagramTypes */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">GET</span>
                <span className="font-mono">/v1/diagramTypes</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Get all diagram types.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "message": "diagram feteched",
  "success": true,
  "diagramTypes": [
    {
      "_id": "61934ec8b8e9a842e89f3c21",
      "name": "Circuit Diagram",
      "description": "Diagrams showing electrical circuits and components",
      "category": "Electronics",
      "created_at": "2023-05-10T15:30:45.123Z"
    },
    // More diagram types...
  ]
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint: POST /v1/createSubjectType */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">POST</span>
                <span className="font-mono">/v1/createSubjectType</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Create a new subject type.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Request Body</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "name": "Electrical Engineering",
  "description": "Subject covering electrical systems and principles"
}`}
                </pre>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "message": "subject created",
  "success": true,
  "subject": {
    "_id": "61934ec8b8e9a842e89f3c25",
    "name": "Electrical Engineering",
    "description": "Subject covering electrical systems and principles",
    "diagrams": [],
    "created_at": "2023-05-10T15:30:45.123Z"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search API Content */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Search API</h2>
            <p className="text-gray-600 mb-6">
              Search and find diagrams with advanced filtering
            </p>
            
            {/* Endpoint: GET /v1/diagram */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">GET</span>
                <span className="font-mono">/v1/diagram</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Search diagrams with basic text query and filters.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Query Parameters</h3>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-4 border">Parameter</th>
                      <th className="text-left py-2 px-4 border">Type</th>
                      <th className="text-left py-2 px-4 border">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border">query</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">Text to search for in diagrams</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">limit</td>
                      <td className="py-2 px-4 border">Number</td>
                      <td className="py-2 px-4 border">Maximum number of results (default: 20)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">page</td>
                      <td className="py-2 px-4 border">Number</td>
                      <td className="py-2 px-4 border">Page number for pagination (default: 1)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">subjects</td>
                      <td className="py-2 px-4 border">JSON String</td>
                      <td className="py-2 px-4 border">Array of subject names to filter by</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border">quality</td>
                      <td className="py-2 px-4 border">String</td>
                      <td className="py-2 px-4 border">Quality rating filter (Low, Medium, High)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "results": [
    {
      "_id": "61934ec8b8e9a842e89f3c21",
      "title": "Circuit Diagram",
      "image_url": "https://cdn.example.com/uploads/image1.jpg",
      "filename": "circuit.jpg",
      "subjects": ["Electronics", "Engineering"],
      "tags": ["circuit", "electricity"],
      "quality_rating": "High",
      "sourceType": "Textbook",
      "sub_category": "Digital Circuits",
      "upload_date": "2023-05-10T15:30:45.123Z",
      "searchScore": 0.89
    },
    // More results...
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "skip": 0,
    "hasMore": true
  }
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint: POST /v1/diagram/advanced */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">POST</span>
                <span className="font-mono">/v1/diagram/advanced</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Description</h3>
                <p>Advanced search with more complex filtering options.</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Request Body</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "textQuery": "circuit voltage",
  "subjects": ["Electronics", "Physics"],
  "tags": ["resistance", "current"],
  "quality": "High",
  "minQualityScore": 70,
  "dateRange": {
    "from": "2023-01-01",
    "to": "2023-12-31"
  },
  "format": "image/jpeg",
  "limit": 10,
  "page": 1,
  "sortBy": "quality"
}`}
                </pre>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Response</h3>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`{
  "results": [
    {
      "_id": "61934ec8b8e9a842e89f3c21",
      "title": "Circuit Diagram",
      "image_url": "https://cdn.example.com/uploads/image1.jpg",
      // Additional properties...
    },
    // More results...
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* GraphQL API Content */}
      {activeTab === 'graphql' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">GraphQL API</h2>
            <p className="text-gray-600 mb-6">
              GraphQL interface for complex and efficient data fetching
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Endpoint</h3>
              <div className="bg-gray-100 p-2 rounded">
                <code>POST /api/graphql</code>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Available Queries</h3>
              
              <div className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">getAllDiagrams</h4>
                <p className="mb-2">Fetch all diagrams with pagination.</p>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`query {
  getAllDiagrams(page: 1, limit: 10) {
    diagrams {
      _id
      title
      image_url
      filename
      quality_rating
      created_at
    }
    total
    totalPages
    currentPage
  }
}`}
                </pre>
              </div>
              
              <div className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">getDiagramById</h4>
                <p className="mb-2">Fetch a single diagram by ID.</p>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`query {
  getDiagramById(id: "61934ec8b8e9a842e89f3c21") {
    _id
    title
    image_url
    filename
    subjectId {
      _id
      name
    }
    quality_scores {
      overall_quality
      blur_score
      brightness_score
    }
    extracted_text
    created_at
  }
}`}
                </pre>
              </div>
              
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">getAllDiagramsBySubjectType</h4>
                <p className="mb-2">Fetch all diagrams by subject type with pagination.</p>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`query {
  getAllDiagramsBySubjectType(
    subjectId: "61934ec8b8e9a842e89f3c25",
    page: 1,
    limit: 10
  ) {
    diagrams {
      _id
      title
      image_url
      created_at
    }
    total
    totalPages
    currentPage
  }
}`}
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Schema Types</h3>
              
              <div className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Diagram</h4>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`type Diagram {
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
}`}
                </pre>
              </div>
              
              <div className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Subject</h4>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`type Subject {
  _id: ID!
  name: String!
  description: String
  diagrams: [Diagram!]!
  createdAt: String!
}`}
                </pre>
              </div>
              
              <div className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">QualityScores</h4>
                <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`type QualityScores {
  overall_quality: Float!
  blur_score: Float!
  brightness_score: Float!
  contrast_score: Float!
  detail_score: Float!
  edge_density: Float!
  noise_level: Float!
  sharpness: Float!
}`}
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Example Usage</h3>
              <p>Make a POST request to <code>/api/graphql</code> with a JSON body containing your GraphQL query:</p>
              
              <pre className="bg-gray-100 p-2 rounded block mt-2 overflow-auto">
{`// Request
fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: \`
      query {
        getAllDiagrams(page: 1, limit: 10) {
          diagrams {
            _id
            title
            image_url
          }
          total
          currentPage
        }
      }
    \`
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Code Examples Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Code Examples</h2>
        <p className="text-gray-600 mb-4">
          Here are examples of how to use the API in different programming languages
        </p>

        <div className="border-b border-gray-200 mb-4 pb-2">
          <div className="flex space-x-4 mb-4">
            <button 
              className={getCodeTabStyles('javascript')}
              onClick={() => setActiveCodeTab('javascript')}
            >
              JavaScript
            </button>
            <button 
              className={getCodeTabStyles('python')}
              onClick={() => setActiveCodeTab('python')}
            >
              Python
            </button>
            <button 
              className={getCodeTabStyles('curl')}
              onClick={() => setActiveCodeTab('curl')}
            >
              cURL
            </button>
          </div>
        </div>

        {/* JavaScript Example */}
        {activeCodeTab === 'javascript' && (
          <div>
            <h3 className="font-medium mb-2">Upload and Analyze an Image</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto mb-4">
{`// Uploading and analyzing an image with fetch
async function uploadImage(file, metadata) {
  const formData = new FormData();
  formData.append('image', file);
  
  // Add metadata
  formData.append('title', metadata.title);
  formData.append('subjectId', metadata.subjectId);
  formData.append('diagramTypeId', metadata.diagramTypeId);
  
  if (metadata.tags) {
    metadata.tags.forEach(tag => formData.append('tags', tag));
  }
  
  try {
    const response = await fetch('http://localhost:4000/api/v1/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}`}
            </pre>

            <h3 className="font-medium mb-2">Search for Diagrams</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
{`// Searching for diagrams
async function searchDiagrams(query, filters = {}) {
  const params = new URLSearchParams({
    query,
    ...filters
  });
  
  try {
    const response = await fetch(\`http://localhost:4000/api/v1/diagram?\${params}\`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching diagrams:', error);
    throw error;
  }
}`}
            </pre>
          </div>
        )}

        {/* Python Example */}
        {activeCodeTab === 'python' && (
          <div>
            <h3 className="font-medium mb-2">Upload and Analyze an Image</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto mb-4">
{`# Uploading and analyzing an image with requests
import requests

def upload_image(file_path, metadata):
    url = 'http://localhost:4000/api/v1/analyze'
    
    # Prepare files and data
    files = {
        'image': open(file_path, 'rb')
    }
    
    data = {
        'title': metadata['title'],
        'subjectId': metadata['subjectId'],
        'diagramTypeId': metadata['diagramTypeId']
    }
    
    # Add optional metadata
    if 'tags' in metadata:
        data['tags'] = metadata['tags']
    
    try:
        response = requests.post(url, files=files, data=data)
        return response.json()
    except Exception as e:
        print(f"Error uploading image: {e}")
        raise`}
            </pre>

            <h3 className="font-medium mb-2">Search for Diagrams</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
{`# Searching for diagrams
import requests

def search_diagrams(query, filters=None):
    url = 'http://localhost:4000/api/v1/diagram'
    
    params = {'query': query}
    if filters:
        params.update(filters)
    
    try:
        response = requests.get(url, params=params)
        return response.json()
    except Exception as e:
        print(f"Error searching diagrams: {e}")
        raise`}
            </pre>
          </div>
        )}

        {/* cURL Example */}
        {activeCodeTab === 'curl' && (
          <div>
            <h3 className="font-medium mb-2">Upload and Analyze an Image</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto mb-4">
{`# Upload and analyze an image
curl -X POST \\
  http://localhost:4000/api/v1/analyze \\
  -F 'image=@/path/to/diagram.jpg' \\
  -F 'title=Circuit Diagram' \\
  -F 'subjectId=61934ec8b8e9a842e89f3c25' \\
  -F 'diagramTypeId=61934ec8b8e9a842e89f3c21' \\
  -F 'tags=electronics' \\
  -F 'tags=circuit'`}
            </pre>

            <h3 className="font-medium mb-2">Search for Diagrams</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
{`# Search for diagrams
curl -X GET \\
  'http://localhost:4000/api/v1/diagram?query=circuit&limit=10&page=1'`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocumentation;