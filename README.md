# Task Manager - Full Stack Application

## Overview
This is a full-stack task management application designed to showcase modern web development practices, combining a React frontend, a Node.js/Express backend, a PostgreSQL database with `pgvector` for vector search, and Python-based semantic search using `sentence-transformers`. The application supports CRUD operations, semantic search with highlighted similarity scores, local storage caching with a 5-minute TTL, and a responsive UI. It is fully containerized using Docker and Docker Compose for consistent deployment.

Developed as part of an evaluation for a Full Stack Web Developer role, this project emphasizes robust architecture, creative presentation, and innovative features. The goal was to "build something you’re proud of," with no strict "right" way, allowing for unique approaches and solutions. This README details the approach, design decisions, trade-offs, creative innovations, and future enhancements.

## Features
- **CRUD Operations**: Create, read, update, and delete tasks with title, description, and status (todo, in progress, done).
- **Semantic Search**: Perform vector-based search on task descriptions using `sentence-transformers` and `pgvector`, with results sorted by cosine similarity.
- **Creative Search Presentation**: Display search results with highlighted similarity scores (e.g., color-coded relevance bars) and matched keywords in task descriptions.
- **Local Storage Caching**: Cache tasks in the browser’s local storage with a 5-minute TTL for performance and limited offline access.
- **Responsive Design**: Mobile-friendly UI built with CSS Grid, Flexbox, and Tailwind CSS animations.
- **Containerization**: Deployed with Docker and Docker Compose for portability.
- **Error Handling**: Comprehensive handling for API, database, and search errors with user-friendly messages.
- **Health Checks**: Backend health endpoint (`/api/health`) and PostgreSQL health checks in Docker Compose.
- **pgvector Integration**: Properly configured `pgvector` extension for storing and querying 384-dimensional task embeddings.

## Tech Stack
- **Frontend**: React 18, Axios, Tailwind CSS, custom animations
- **Backend**: Node.js 16, Express, `pg` for PostgreSQL, Python 3.10 (`sentence-transformers`)
- **Database**: PostgreSQL 15 with `pgvector` extension
- **AI Search**: `sentence-transformers` (all-MiniLM-L6-v2) for 384D embeddings
- **Containerization**: Docker, Docker Compose
- **Other Tools**: Caddy for frontend proxy, Node.js `child_process` for Python integration

## Project Structure
The project is organized for clarity and modularity, with separate directories for frontend, backend, and configuration files. Below is the structure, formatted for visual appeal:

task-manager-app/
├── backend/                    # Backend service (Node.js + Python)
│   ├── src/                    # Source code
│   │   ├── app.js              # Express server and API routes
│   │   └── vector_service.py   # Python script for vector search
│   ├── Dockerfile              # Docker configuration for backend
│   ├── package.json            # Node.js dependencies
│   └── requirements.txt        # Python dependencies
├── frontend/                   # Frontend service (React)
│   ├── src/                    # React source code
│   │   ├── components/         # Reusable React components
│   │   │   ├── TaskList.js     # Main task display component
│   │   │   └── TaskList.css    # Component-specific styles
│   │   ├── services/           # API and caching logic
│   │   │   └── api.js          # API service with local storage
│   │   ├── App.js              # Root React component
│   │   ├── App.css             # Global styles
│   │   └── index.js            # React entry point
│   ├── public/                 # Static assets
│   │   └── index.html          # HTML template
│   ├── Dockerfile              # Docker configuration for frontend
│   ├── Caddyfile               # Caddy configuration for proxy
│   └── package.json            # Frontend dependencies
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # Project documentation
## Approach

### 1. **Architecture Design**
The application adopts a **microservices-inspired monolithic architecture**, with separate frontend, backend, and database services orchestrated by Docker Compose. Key components:
- **Frontend**: A React SPA communicating with the backend via REST API. It uses local storage caching and a creative UI for search results.
- **Backend**: An Express server for CRUD operations, integrated with PostgreSQL and a Python script (`vector_service.py`) for vector search.
- **Database**: PostgreSQL with `pgvector` for storing tasks and their 384-dimensional embeddings.
- **Vector Search**: Python-based `sentence-transformers` generates embeddings, queried via `pgvector`’s cosine similarity operator (`<->`).

### 2. **Development Process**
- **File Structure**: Organized as specified, with modular components (e.g., `TaskList.js`, `app.js`, `vector_service.py`).
- **Docker Setup**: Defined three services with health checks, volume persistence, and optimized builds using `COMPOSE_BAKE=true`.
- **pgvector Setup**: Enabled the `pgvector` extension in PostgreSQL and created a `tasks` table with a `vector(384)` column for embeddings.
- **Search Implementation**: Developed a `/api/tasks/search` endpoint that returns tasks sorted by similarity, with frontend UI enhancements for result presentation.
- **Dependency Management**: Managed Node.js (`package.json`) and Python (`requirements.txt`) dependencies, resolving conflicts (e.g., `numpy`, `torch`).
- **Testing**: Validated CRUD, caching, search, and error handling using Docker.

### 3. **Challenges and Solutions**
- **Python Dependencies**:
  - **Challenge**: Installing `sentence-transformers==2.2.2`, `numpy==1.24.3`, and `torch==1.12.1` in `node:16` (Debian 10) failed due to Python version issues.
  - **Solution**: Compiled Python 3.10 from source, added system libraries (`libblas-dev`, `libatlas-base-dev`), and pinned compatible versions.
- **Docker Build Errors**:
  - **Challenge**: Ubuntu-specific `ppa:deadsnakes/ppa` failed on Debian 10.
  - **Solution**: Used Python source installation to avoid PPAs.
- **pgvector Setup**:
  - **Challenge**: Ensuring `pgvector` was enabled and embeddings were correctly stored.
  - **Solution**: Used the `pgvector/pgvector:pg15` image, executed `CREATE EXTENSION vector;` on startup, and validated embedding storage via SQL queries.
- **Local Development**:
  - **Challenge**: Local `npm install` failed on Windows (Python 3.12) due to missing `setuptools`.
  - **Solution**: Removed `sentence-transformers` from `package.json` and provided Docker-based development instructions.

## Design Decisions

### 1. **Frontend: React with Enhanced Search UI**
- **Decision**: Built a React SPA with a `TaskService` class (`api.js`) for API calls and local storage caching. Search results are presented with similarity scores visualized as color-coded progress bars (green for high similarity, red for low) and highlighted matched keywords in descriptions.
- **Rationale**: React enables a dynamic UI, and caching improves performance. The creative presentation makes search results intuitive and engaging, aligning with the requirement for "creative presentation of search results."
- **Trade-Offs**:
  - **Pros**: Fast, user-friendly UI with visual feedback.
  - **Cons**: Local storage limits cache size (~5MB). Highlighting keywords requires client-side text processing, which could be server-side for better performance.

### 2. **Backend: Node.js with Python Integration**
- **Decision**: Used Express for REST APIs and `child_process` to run `vector_service.py` for embedding generation and search.
- **Rationale**: Express is lightweight, and Python leverages `sentence-transformers` for robust semantic search. `child_process` simplifies integration without a separate Python server.
- **Trade-Offs**:
  - **Pros**: Combines Node.js and Python strengths.
  - **Cons**: Process spawning adds overhead. A Node.js-based embedding model (e.g., ONNX) could reduce complexity.

### 3. **Database: PostgreSQL with pgvector**
- **Decision**: Used PostgreSQL with `pgvector` to store tasks and 384-dimensional embeddings in a `vector(384)` column. Enabled the extension via `CREATE EXTENSION vector;` in the database initialization.
- **Rationale**: PostgreSQL is reliable, and `pgvector` supports efficient vector similarity searches. The setup is lightweight compared to dedicated vector databases.
- **Trade-Offs**:
  - **Pros**: Scalable, integrated with SQL, open-source.
  - **Cons**: `pgvector` setup requires specific configuration. A vector database (e.g., Pinecone) could optimize large-scale search but adds complexity.

### 4. **Vector Search: sentence-transformers**
- **Decision**: Employed `sentence-transformers` (all-MiniLM-L6-v2) to generate embeddings, stored in `pgvector`, and implemented a `/api/tasks/search` endpoint that returns tasks sorted by cosine similarity.
- **Rationale**: The model is lightweight (~80MB) and effective for semantic search. The endpoint returns relevance scores, which are visualized in the UI.
- **Trade-Offs**:
  - **Pros**: Accurate, compact model.
  - **Cons**: CPU-intensive embedding generation. Cloud-based embeddings (e.g., OpenAI) could reduce load but introduce costs.

### 5. **Containerization: Docker Compose**
- **Decision**: Orchestrated services with Docker Compose, using multi-stage builds for the frontend (React + Caddy) and backend (Node.js + Python).
- **Rationale**: Ensures consistent environments and simplifies deployment. Caddy replaced Nginx for its automatic HTTPS and simpler configuration.
- **Trade-Offs**:
  - **Pros**: Portable, reproducible.
  - **Cons**: Docker adds setup complexity (e.g., debugging Python builds).

### 6. **Error Handling and Validation**
- **Decision**: Implemented Express middleware for API errors, React try-catch for UI errors, and input validation for tasks (e.g., non-empty title).
- **Rationale**: Enhances reliability and user experience.
- **Trade-Offs**:
  - **Pros**: Robust error feedback.
  - **Cons**: Adds code complexity. A validation library (e.g., Joi) could improve rigor.

## Creativity and Innovation
Aligned with the directive to "build something you’re proud of," the project incorporates unique features:
- **Search Result Visualization**: Similarity scores are displayed as progress bars (green ≥0.8, yellow 0.6–0.8, red <0.6), and matched keywords are highlighted using a custom text-matching algorithm in `TaskList.js`. This makes search results visually engaging and intuitive.
- **Dynamic Animations**: Task cards animate on hover and creation using Tailwind CSS transitions, enhancing the user experience.
- **Hybrid Backend**: Combining Node.js and Python via `child_process` is an innovative way to leverage AI libraries without a separate microservice.
- **Local Storage Strategy**: The 5-minute TTL cache balances freshness and performance, with a fallback to cached data during network failures.
- **pgvector Optimization**: Indexes on the `vector` column (`CREATE INDEX ON tasks USING ivfflat (embedding vector_cosine_ops)`) improve search performance for large datasets.

These features demonstrate creativity while maintaining functionality, making the application both practical and engaging.

## Trade-Offs
- **Performance vs. Simplicity**: `sentence-transformers` is simpler than cloud AI but slower for large-scale use.
- **Node.js vs. Python**: Python integration adds complexity but enables advanced AI capabilities.
- **Local vs. Server-Side Caching**: Local storage is simple but limited compared to Redis.
- **Debian vs. Ubuntu**: Used `node:16` (Debian 10) for Node.js compatibility, but compiling Python was slower than using `node:20` (Ubuntu).

## Challenges and Lessons Learned
- **Python Dependencies**:
  - Resolved conflicts with `numpy`, `torch`, and `sentence-transformers` by compiling Python 3.10 and adding system libraries.
  - Lesson: Test dependencies in isolated containers early.
- **Docker Debugging**:
  - Overcame `ppa:deadsnakes/ppa` and empty `Dockerfile` errors by verifying base image compatibility.
  - Lesson: Log intermediate steps (e.g., `RUN python --version`) for faster debugging.
- **pgvector Setup**:
  - Ensured `pgvector` was enabled and embeddings were correctly stored/queried.
  - Lesson: Validate database extensions and schemas early.
- **Cross-Platform Issues**:
  - Addressed Windows-specific errors (e.g., `setuptools`) by prioritizing Docker.
  - Lesson: Docker minimizes platform-specific issues.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone <your-repo>


Navigate to the project directory:cd task-manager-app


Set COMPOSE_BAKE for optimized builds:export COMPOSE_BAKE=true


Build and run:docker-compose up --build


Access the application:
Frontend: http://localhost:3000
Backend API: http://localhost:5000/api/health



pgvector and Embedding Storage Setup

Image: Used pgvector/pgvector:pg15 Docker image.
Extension: Enabled pgvector with CREATE EXTENSION vector; in the database initialization script.
Schema: Created a tasks table with columns:
id (SERIAL PRIMARY KEY)
title (VARCHAR)
description (TEXT)
status (VARCHAR)
embedding (vector(384))


Embedding Generation: On task creation/update, vector_service.py generates a 384D embedding for the description using sentence-transformers and stores it in the embedding column.
Indexing: Added an ivfflat index (CREATE INDEX ON tasks USING ivfflat (embedding vector_cosine_ops)) for faster vector searches.
Validation: Tested embedding storage with SQL queries (SELECT id, embedding FROM tasks WHERE embedding IS NOT NULL;).

Search Feature Implementation

Endpoint: POST /api/tasks/search accepts a { query } body, generates an embedding for the query, and queries pgvector for tasks ordered by cosine similarity (SELECT *, embedding <-> $1 AS similarity FROM tasks ORDER BY similarity LIMIT 10;).
Frontend: TaskList.js displays results with:
Similarity Scores: Color-coded progress bars (green for high similarity, red for low).
Keyword Highlighting: Matches query terms in descriptions using a regex-based algorithm, wrapping matches in <mark> tags.


Testing: Created tasks (e.g., “Buy groceries and milk”), searched for “shopping,” and verified relevant results with high similarity scores.

API Endpoints

GET /api/health: Check server status.
GET /api/tasks: Fetch all tasks.
POST /api/tasks: Create a task (body: { title, description, status }).
PUT /api/tasks/:id: Update a task (body: { title, description, status }).
DELETE /api/tasks/:id: Delete a task.
POST /api/tasks/search: Vector search (body: { query }).

Testing

CRUD: Add, edit, delete tasks via UI and verify with GET /api/tasks.
Caching: Disconnect network, confirm cached tasks load.
Search: Search for “shopping” with tasks like “Buy groceries” and verify results with highlighted keywords.
Error Handling: Test invalid inputs (e.g., empty title) and network errors.
pgvector: Query embeddings directly to ensure storage and retrieval.

Future Improvements

Optional Challenge: Offline Support:
Implement service workers to cache API responses and assets for full offline access.
Use IndexedDB to store tasks locally, replacing local storage for larger datasets.


Authentication: Add JWT-based user authentication for task ownership.
Server-Side Caching: Use Redis for caching API responses.
Performance: Replace sentence-transformers with ONNX-based embeddings in Node.js.
CI/CD: Set up GitHub Actions for automated testing and deployment.
Scalability: Deploy to Kubernetes for load balancing and high availability.
Advanced Search: Add filters (e.g., status, date) and fuzzy search for typos.
Accessibility: Improve ARIA labels and keyboard navigation for inclusivity.

Conclusion
This task management application showcases a robust, creative, and innovative full-stack solution. The integration of pgvector, semantic search with visualized results, and a hybrid Node.js/Python backend demonstrates technical depth and originality. Despite challenges with dependencies and Docker, the project delivers a functional, engaging application with clear paths for enhancement. I’m proud of the unique UI elements, efficient search, and reliable architecture, aligning with the goal to "build something you’re proud of."
For feedback, contact [Your Name] at [Your Email].```
