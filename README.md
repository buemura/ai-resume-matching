# AI Resume Matching

An AI-powered platform that matches job candidates to job postings using vector embeddings and semantic similarity. Upload resumes and job descriptions, and let the system automatically rank the best matches using OpenAI embeddings stored in PostgreSQL with pgvector.

![Dashboard](docs/dashboard.png)

![Jobs List](docs/jobs-list.png)

![Resume Detail](docs/resume-detail.png)

![Job Detail with Match](docs/job-detail.png)

## Features

- **Vector-based matching** — Converts resumes and job descriptions into embeddings and computes cosine similarity
- **Skill extraction** — Automatically extracts and normalizes skills using GPT
- **Bias-reduced ranking** — Optional PII stripping for fairer matching
- **File upload** — Supports PDF and DOCX resume uploads
- **Recruiter dashboard** — Web interface for managing jobs, resumes, and viewing match results

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.12, FastAPI, SQLAlchemy (async) |
| Database | PostgreSQL 16 + pgvector |
| AI/ML | OpenAI `text-embedding-3-small`, `gpt-4o-mini` |
| Infrastructure | Docker, Docker Compose |

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Python](https://www.python.org/) 3.12+
- [Node.js](https://nodejs.org/) 20+
- [OpenAI API key](https://platform.openai.com/api-keys)

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd ai-resume-matching
   ```

2. **Configure environment variables**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Edit `apps/api/.env` and set your OpenAI API key:

   ```
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/resume_matching
   OPENAI_API_KEY=your-openai-api-key-here
   ```

   Edit `apps/web/.env`:

   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Start the database**

   ```bash
   docker compose up -d
   ```

4. **Install backend dependencies**

   ```bash
   cd apps/api
   pip install -e .
   ```

5. **Install frontend dependencies**

   ```bash
   cd apps/web
   npm install
   ```

## Running

Start each service in a separate terminal:

```bash
# Terminal 1 — Database (if not already running)
docker compose up

# Terminal 2 — Backend API
cd apps/api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 — Frontend
cd apps/web
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:8000`.

### Makefile shortcuts

```bash
make up      # Start containers (detached)
make down    # Stop containers
make build   # Build images
make logs    # View container logs
```

## Testing

```bash
# Frontend
cd apps/web
npm run test

# Backend
cd apps/api
pytest
```
