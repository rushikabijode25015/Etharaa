# Deploy in 5 minutes (no card, copy-paste only)

## Step 1 — Neon (you already did this)
1. Open Neon → **Connect** → **Connection string**
2. Click **Copy snippet** (do not edit anything)
3. Keep this copied text for Step 2

---

## Step 2 — Koyeb backend
1. Go to https://app.koyeb.com
2. **Create App** → **GitHub** → choose `rushikabijode25015/Etharaa`
3. Fill exactly:

| Field | Value |
|---|---|
| Name | `ethara-backend` (any name is fine) |
| Root directory | `backend` |
| Builder | Buildpack |
| Build command | `pip install -r requirements.txt` |
| Run command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. Environment variables (click **Add variable**):

| Key | Value |
|---|---|
| `DATABASE_URL` | paste Neon connection string **as copied** |
| `CORS_ORIGINS` | `*` |

5. Click **Deploy**
6. After deploy, open: `https://YOUR-APP.koyeb.app/health`
   - Expected: `{"status":"ok"}`

---

## Step 3 — Vercel frontend
1. Go to https://vercel.com/new
2. Import `rushikabijode25015/Etharaa`
3. Fill exactly:

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |

4. Environment variable:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://YOUR-APP.koyeb.app` |

5. Click **Deploy**
6. Open your Vercel URL and test Products / Customers / Orders

---

## If Koyeb build fails
Send screenshot of the error log. Common fixes:
- Ensure root directory is `backend` (not repo root)
- Ensure `DATABASE_URL` is set before deploy

## Submission links
- GitHub: https://github.com/rushikabijode25015/Etharaa
- Backend: `https://YOUR-APP.koyeb.app`
- Frontend: `https://YOUR-APP.vercel.app`
