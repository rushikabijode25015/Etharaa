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

## Free no-card deployment path
If Render asks for billing details, use this path:
- Database: Neon (Postgres free tier)
- Backend: Koyeb (free web service)
- Frontend: Vercel (free static hosting)

### 1) Create free Postgres on Neon
1. Sign up at Neon and create a new project/database.
2. Copy connection string and convert to SQLAlchemy URL format:

```text
postgresql+psycopg2://<user>:<password>@<host>/<db>?sslmode=require
```

3. Save as `DATABASE_URL` for backend deployment.

### 2) Deploy backend on Koyeb (free)
1. Create new Web Service from GitHub repo `rushikabijode25015/Etharaa`.
2. Root directory: `backend`
3. Build command:

```bash
pip install -r requirements.txt
```

4. Run command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

5. Environment variables:
   - `DATABASE_URL` = Neon SQLAlchemy URL
   - `CORS_ORIGINS` = `*` (or your frontend domain)

6. Deploy and copy backend URL:
   - `https://<your-backend>.koyeb.app`

### 3) Deploy frontend on Vercel (free)
1. Create new project from same GitHub repo.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Add env var:
   - `VITE_API_BASE_URL` = `https://<your-backend>.koyeb.app`
5. Deploy to get:
   - `https://<your-frontend>.vercel.app`

### 4) Verify
- Open frontend URL.
- Create product/customer/order.
- Confirm stock decreases after placing order.

