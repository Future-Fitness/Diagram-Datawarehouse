![image](https://github.com/user-attachments/assets/a2e2a602-61a6-4ac8-b481-fd3350701589)


challenges faced - 
dev pracitces 
explain techstack 
timeline 
technical flow
demo - front & backend

flowchart TB
    subgraph Client
        UI[User Interface]
        REST[REST Client]
    end
    
    subgraph API["API Gateway"]
        Auth[Authentication]
        Rate[Rate Limiter]
        Router[API Router]
    end
    
    subgraph Services["Microservices"]
        ImageSvc[Image Service]
        AnalysisSvc[Analysis Service]
        MetadataSvc[Metadata Service]
        QualitySvc[Quality Scoring]
        TextSvc[Text Extraction]
    end
    
    subgraph Storage
        MongoDB[(MongoDB)]
        S3[(Image Storage)]
        Redis[(Redis Cache)]
    end
    
    UI --> REST
    REST --> Auth
    Auth --> Rate
    Rate --> Router
    
    Router --> ImageSvc
    Router --> AnalysisSvc
    Router --> MetadataSvc
    
    ImageSvc --> S3
    ImageSvc --> MongoDB
    
    AnalysisSvc --> QualitySvc
    AnalysisSvc --> TextSvc
    
    QualitySvc --> MongoDB
    TextSvc --> MongoDB
    
    MetadataSvc --> MongoDB
    
    ImageSvc --> Redis
    MetadataSvc --> Redis
    
    classDef primary fill:#3498db,stroke:#2980b9,color:white
    classDef secondary fill:#2ecc71,stroke:#27ae60,color:white
    classDef storage fill:#95a5a6,stroke:#7f8c8d,color:white
    classDef client fill:#9b59b6,stroke:#8e44ad,color:white
    
    class Auth,Rate,Router primary
    class ImageSvc,AnalysisSvc,MetadataSvc,QualitySvc,TextSvc secondary
    class MongoDB,S3,Redis storage
    class UI,REST client

    sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant ImageSvc as Image Service
    participant AnalysisSvc as Analysis Service
    participant Storage as Image Storage
    participant DB as Database

    Client->>Gateway: Authentication request
    Gateway-->>Client: JWT Token
    
    Note over Client,Gateway: Image Upload Flow
    
    Client->>Gateway: POST /api/images with image file
    Gateway->>ImageSvc: Forward request
    ImageSvc->>Storage: Store image file
    Storage-->>ImageSvc: Return image URL
    ImageSvc->>DB: Create initial metadata record
    DB-->>ImageSvc: Confirm creation
    ImageSvc->>AnalysisSvc: Request analysis
    
    Note right of AnalysisSvc: Asynchronous Processing
    
    ImageSvc-->>Client: Return initial response (202 Accepted)
    
    AnalysisSvc->>Storage: Retrieve image
    Storage-->>AnalysisSvc: Return image data
    AnalysisSvc->>AnalysisSvc: Perform analysis (quality, color, text)
    AnalysisSvc->>DB: Update metadata with analysis results
    DB-->>AnalysisSvc: Confirm update
    
    Note over Client,DB: Image Retrieval Flow
    
    Client->>Gateway: GET /api/images/{id}
    Gateway->>ImageSvc: Forward request
    ImageSvc->>DB: Retrieve image metadata
    DB-->>ImageSvc: Return image data
    ImageSvc-->>Client: Return complete image data
    
    Note over Client,DB: Bulk Retrieval Flow
    
    Client->>Gateway: GET /api/images with filters
    Gateway->>ImageSvc: Forward request
    ImageSvc->>DB: Query images with filters
    DB-->>ImageSvc: Return matching images
    ImageSvc-->>Client: Return image collection



    classDiagram
    class Image {
        String _id
        String title
        String image_url
        String filename
        Date created_at
        Date upload_date
        String sub_category
        String sourceType
        String author
        String notes
        String extracted_text
        String quality_rating
        ObjectId subjectId
        ObjectId diagramTypeId
        Object file_info
        Object quality_scores
        Object color_analysis
    }
    
    class FileInfo {
        String format
        String resolution
        Number file_size_mb
        Object dimensions
    }
    
    class Dimensions {
        Number width
        Number height
        Number megapixels
    }
    
    class QualityScores {
        Number overall_quality
        Number blur_score
        Number brightness_score
        Number contrast_score
        Number detail_score
        Number edge_density
        Number noise_level
        Number sharpness
    }
    
    class ColorAnalysis {
        Array~Array~Number~~ dominant_colors
        Object color_distribution
    }
    
    class ColorDistribution {
        Array~Number~ mean_rgb
        Array~Number~ mean_hsv
        Array~Number~ mean_lab
        Array~Number~ std_rgb
    }
    
    class Subject {
        String _id
        String name
        String description
    }
    
    class DiagramType {
        String _id
        String name
        String description
        String category
    }
    
    Image "1" -- "1" FileInfo : contains
    FileInfo "1" -- "1" Dimensions : contains
    Image "1" -- "1" QualityScores : contains
    Image "1" -- "0..1" ColorAnalysis : contains
    ColorAnalysis "1" -- "1" ColorDistribution : contains
    Image "0..1" -- "1" Subject : belongs to
    Image "0..1" -- "1" DiagramType : categorized as




    setup -
locally
    docker network create nginx-network
