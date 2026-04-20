# TennisLodge — REST API (Backend)

Express + MongoDB API for the **TennisLodge** project. It is consumed by the Angular app in `../Frontend/` (via the dev proxy: `/api` → `http://localhost:3000`).

**Full-stack setup (MongoDB, ports, env vars):** see the repository root **[`README.md`](../README.md)**.

---

## Run locally

```bash
cd Backend
npm install
npm start
```

The `start` script runs `node .` (entry `index.js`). Default listen port: **`PORT`** or **3000** (`config/config.js`). A successful start logs something like `Listening on port 3000!`.

---

## Base URL

All routes below are mounted under **`/api`** (e.g. `http://localhost:3000/api/...`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/test` | Health / test route (see `router/test.js`) |

---

## Authentication

The API uses **HTTP-only cookies** (JWT) for the session after login or register. The Angular client sends requests with **`credentials: true`** (`withCredentials`).

**There is no predefined “demo” user or teacher account in the repository.** Anyone testing the app (including a professor) must **register** first or use an account they create in their own database.

### Register — `POST /api/register`

Body (JSON), required fields enforced in `controllers/auth.js`:

- `email` (string, valid email)
- `username`, `password`, `repeatPassword`
- `firstName`, `lastName`
- `tel` optional

On success, sets the auth cookie and returns user JSON (without password).

### Login — `POST /api/login`

Body (JSON):

- `email` (string)
- `password` (string)

Login is **by email and password**, not by username.

### Logout — `POST /api/logout`

Clears the session cookie (see `controllers/auth.js`).

### User profile (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users/profile` | Current user |
| `PUT` | `/api/users/profile` | Update profile fields |
| `POST` | `/api/users/profile/picture` | Upload profile photo (field name `photo` per controller) |

---

## TennisLodge domain routes (mounted in `router/index.js`)

- **`/api/tournaments`** — tournaments CRUD (see `router/tournaments.js`)
- **`/api/accommodations`** — accommodation listings (see `router/accommodations.js`)
- **`/api/accommodation-requests`** — stay requests (see `router/accommodationRequests.js`)

Legacy workshop routes (`/themes`, `/posts`, `/likes`, etc.) may still be registered for older exercises; the TennisLodge frontend does not rely on them for the exam features described in the root `README.md`.

---

## Configuration

Connection string and defaults: **`config/config.js`** (`MONGO_URI` or Atlas-related vars, `PORT`, `NODE_ENV`, CORS origins).

Optional secrets with defaults in code: **`SECRET`** (JWT), **`COOKIESECRET`**, **`SALTROUNDS`** — see `utils/jwt.js`, `config/express.js`, `models/userModel.js`.
