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
