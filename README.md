![image](https://github.com/user-attachments/assets/a2e2a602-61a6-4ac8-b481-fd3350701589)



# Image Analysis Platform

A comprehensive platform for uploading, analyzing, and managing diagram images with automated quality assessment, text extraction, and intelligent search capabilities.

## System Architecture

The project consists of several integrated components:
- **Frontend Application**: React-based client application
- **Backend API**: Express.js server with REST and GraphQL endpoints
- **Processing Services**: Background workers and Flask microservice for image analysis
- **Storage Services**: MongoDB for metadata and AWS S3 for image storage
- **Message Queue**: Redis for managing background processing jobs

![System Architecture](architecture-diagram.png)

## Features

- Image upload and automated analysis
- Text extraction from diagrams
- Quality assessment and scoring
- Advanced search with filtering and autocomplete
- Similar diagram recommendations
- GraphQL API for flexible data querying
- Background processing for handling large workloads
- Admin dashboard for monitoring system performance

## Prerequisites

- Docker and Docker Compose
- Node.js (v14+ recommended)
- npm or yarn
- AWS account with S3 bucket configured
- MongoDB Atlas account or local MongoDB instance
- Redis

## Environment Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/image-analysis-platform.git
   cd image-analysis-platform
   ```

2. Create `.env` files

   **For backend (./.env):**
   ```
   # Server
   PORT=4000
   NODE_ENV=development

   # MongoDB
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/diagrams

   # AWS
   AWS_ACCESS_KEY=your_access_key
   AWS_SECRET_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379

   # Flask Microservice
   FLASK_API_URL=http://flask-service:5000
   ```

   **For client (./client/.env):**
   ```
   VITE_API_URL=http://localhost:4000/api
   VITE_GRAPHQL_URL=http://localhost:4000/api/graphql
   ```

## Running with Docker Compose

For a complete development environment:

1. Build and start all services
   ```bash
   docker-compose up --build
   ```

   This will start:
   - Backend API (http://localhost:4000)
   - Frontend application (http://localhost:3000)
   - Redis queue
   - Worker services
   - Flask analysis microservice

2. To stop all services
   ```bash
   docker-compose down
   ```

## Running Components Individually

### Backend Setup

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

   The API will be available at http://localhost:4000

### Frontend Setup

1. Navigate to the client directory
   ```bash
   cd client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

## API Documentation

### REST API Endpoints

- `POST /api/v1/analyze` - Upload and analyze an image
- `GET /api/v1/diagram/:id/status` - Get processing status for a diagram
- `GET /api/v1/getAllImages` - Get all images
- `GET /api/v1/diagram` - Search diagrams with filters
- `GET /api/v1/diagram/autocomplete` - Get search suggestions
- `GET /api/v1/diagram/:diagramId/similar` - Find similar diagrams

### GraphQL API

The GraphQL playground is available at http://localhost:4000/api/graphql

Example queries:
```graphql
# Get all diagrams with pagination
query GetAllDiagrams($page: Int, $limit: Int) {
  getAllDiagrams(page: $page, limit: $limit) {
    diagrams {
      _id
      title
      image_url
    }
    total
    totalPages
    currentPage
  }
}

# Search diagrams
query SearchDiagrams($query: String, $subjectId: ID, $page: Int, $limit: Int) {
  searchDiagrams(query: $query, subjectId: $subjectId, page: $page, limit: $limit) {
    diagrams {
      _id
      title
      image_url
    }
    total
    totalPages
    currentPage
  }
}
```

## Testing

Run the test suite with:

```bash
npm test
```

## Deployment

### Production Deployment

For production deployment, we recommend:

1. Using AWS ECS or Kubernetes for container orchestration
2. Setting up auto-scaling for worker nodes
3. Using a managed Redis service
4. Configuring CloudFront for content delivery

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- AWS for storage and CDN services
- MongoDB for database services
- The Flask and Python communities for image analysis tools
