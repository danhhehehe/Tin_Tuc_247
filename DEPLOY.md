# Huong dan deploy Tin Tuc 247

## Backend Render

- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/health`

## Environment Variables tren Render

```text
NODE_ENV=production
NODE_VERSION=20
CLIENT_URL=https://danhhehehe.github.io
AUTO_SYNC_ON_START=true
SYNC_CONCURRENCY=1
MONGODB_URI=nhap thu cong tren Render, khong dua vao GitHub
```

Test backend:

```text
https://tin-tuc-247-backend.onrender.com/health
```

## Frontend GitHub Pages

```bash
cd frontend
npm install
npm run deploy
```

Trong GitHub: `Settings -> Pages -> Branch gh-pages -> root`.

Khong commit file `.env`. Chi commit cac file `.env.example`.
