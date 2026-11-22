# Shorex Admin Panel

Admin panel (`frontend`) and API (`backend`).

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- npm

## 1. Backend

```bash
cd backend
npm install --legacy-peer-deps
```

Create `backend/.env`:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/Shorex-App
POSTMARK_SERVER_API_TOKEN=
POSTMARK_FROM_EMAIL=no-reply@shorex.app
POSTMARK_MESSAGE_STREAM=outbound
POSTMARK_SAME_DOMAIN_TEST=false
```

Run:

```bash
node src/app.js
```

Health check: [http://localhost:3000/welcome](http://localhost:3000/welcome)

Do **not** run `npm run seed` on a database you care about. That script wipes all collections first.

## 2. Frontend

```bash
cd frontend
npm install
npm start
```

Opens on [http://localhost:3000](http://localhost:3000) by default (React). If the backend is also on 3000, start the API on another port (`PORT=3001`) or change the frontend port.

API base URL is in `frontend/src/constants/api.js` (`baseURL.PRO`). For local API, point it at `http://localhost:3000/` (or the port you used).

## Login

Use an existing `ADMIN` user. Customer (`CLIENT`) accounts cannot sign in to this admin panel.
