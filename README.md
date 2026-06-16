# Ethara Assessment — Inventory & Order Management

Simplified Inventory & Order Management System:
- Products (unique SKU, stock tracking)
- Customers (unique email)
- Orders (cannot place order if stock is insufficient; stock auto-reduces on order)

## Tech
- Backend: FastAPI + SQLAlchemy
- Frontend: React (Vite)
- DB: PostgreSQL
- Containerization: Docker + Docker Compose

## Environment variables
- Backend uses `DATABASE_URL` (required)
- Frontend uses `VITE_API_BASE_URL`

Copy and edit:

```bash
cp .env.example .env
```

## Run with Docker Compose (recommended)
Prereqs: Docker Desktop installed.

```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`

## Backend API (local without Docker)
Prereqs: Python 3.11+ installed and a running Postgres.

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
setx DATABASE_URL "postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME"
uvicorn app.main:app --reload --port 8000
```

## Frontend (local without Docker)
```bash
cd frontend
npm install
npm run dev
```

## Deploy on Render (free)
Create **two services**:

### Backend (Web Service)
- Root directory: `backend`
- Runtime: Docker (or Python)
- Env var: `DATABASE_URL` (use Render PostgreSQL connection string)
- Optional: `CORS_ORIGINS` = `https://<your-frontend>.onrender.com`

### Frontend (Static Site)
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com`

After deploy you will have:
- Frontend URL: `https://<frontend>.onrender.com`
- Backend URL: `https://<backend>.onrender.com`

