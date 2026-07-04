# Tin Tuc 247 Production Deployment

## Backend on Render

Use these settings if you configure the existing Render web service manually:

```text
Root Directory: backend
Build Command: npm ci
Start Command: npm start
Health Check Path: /health
```

Required Render environment variables:

```env
NODE_ENV=production
MONGODB_URI=<MongoDB Atlas connection string>
CLIENT_URL=https://danhhehehe.github.io
AUTO_SYNC_ON_START=true
SYNC_CONCURRENCY=1
```

Keep the real MongoDB Atlas password only in Render Environment Variables. Do not commit `.env`.

This repo also includes `render.yaml`. If you create a Render Blueprint from the repo, Render will use `backend/`, `npm ci`, `npm start`, and `/health` automatically. You still need to fill `MONGODB_URI` in Render because it is marked `sync: false`.

## Frontend on GitHub Pages

```bash
cd frontend
npm install
npm run build
npm run deploy
```

Production builds call:

```text
https://tin-tuc-247-backend.onrender.com
```

If you want to override it, set this before building:

```env
VITE_API_URL=https://tin-tuc-247-backend.onrender.com
```

GitHub Actions can deploy the frontend automatically from `main`. If you want to override the production API URL in Actions, add a repository variable:

```text
Name: VITE_API_URL
Value: https://tin-tuc-247-backend.onrender.com
```

GitHub Pages URL:

```text
https://danhhehehe.github.io/Tin_Tuc_247/
```
