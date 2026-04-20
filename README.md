# TennisLodge

Monorepository for the **TennisLodge** project: an **Angular** web app (`Frontend/`) and a **Node.js + Express + MongoDB** REST API (`Backend/`).

---

## Functional Guide

This guide describes the behaviour implemented in the current codebase (routes in `Frontend/src/app/app.routes.ts` and related functionality).

### 1. Purpose of the application

TennisLodge targets **people travelling to tennis tournaments** and **hosts** who offer accommodation linked to those events. The application supports **browsing tournaments**, **publishing and managing accommodation listings** (authenticated users), **requesting a stay** against a listing, and **managing incoming and outgoing stay requests**, plus **user account** features (registration, sign-in, and profile).

### 2. Main user flows

**Guest (not signed in)**

- Use the **home** page and city suggestions for accommodation search (when the API responds).
- Browse the **tournament catalogue** and open a **tournament detail** page (id in the URL).
- **Register** and **sign in**. The login and register routes redirect to the home page when a session is already active (guest guard).
- Open **legal** pages (privacy, terms, cookies).

**Signed-in user**

- **Profile**: view and update account data (as implemented on the profile page).
- **Accommodation** (routes under `/accommodations`, protected by authentication):
  - List accommodations and open a detail view.
  - **Create** a new listing.
  - **Edit** and **delete** your own listings (via the “mine” area or equivalent actions in the UI).
  - Manage **incoming** and **sent** stay requests (the “incoming” and “sent” pages).
- **Sign out** from the header (logout).

**Unknown routes**

- Any unknown URL shows the **404** page configured on the router.

### 3. Core features

| Area | Content |
|------|---------|
| Authentication | Registration, login, logout; session via API requests with credentials (`withCredentials` on the client). On app load, the current user is loaded from the backend when possible. |
| Tournaments | Public list and detail by id (`/tournaments`, `/tournaments/:id`). |
| Accommodations | CRUD for the accommodation collection on the backend, with list, detail, create, edit, and delete screens on the front (per routes and components under the `accommodations` feature). |
| Profile | Private area at `/profile`. |
| Legal | Content at `/legal/privacy`, `/legal/terms`, `/legal/cookies`. |

### 4. How the user interacts with the system

- **Navigation**: header links (home, tournaments, accommodations) and, when signed in, the account menu (profile, accommodation and request management, logout).
- **Forms**: login, registration, and accommodation/profile forms with validation and on-screen error messages when requests fail.
- **Feedback**: toasts/notifications and loading or empty states in lists (per page).
- **Network errors**: HTTP interceptors show messages and, depending on the request, may clear the session or redirect to login on unauthorized responses.

### 5. Note on the backend

The course assesses the **frontend**; the backend must run so the app can load live data. Default development configuration is described in the following sections.

---

## Prerequisites

- **Node.js** and **npm** (the front end declares `packageManager: "npm@11.8.0"` in `Frontend/package.json`; other recent npm versions may work).
- **MongoDB** reachable:
  - In development, if you do not set connection environment variables, the backend defaults to the connection string in `Backend/config/config.js`: `mongodb://localhost:27017/forum` (`development` mode).
  - Optionally set **`MONGO_URI`**, or **`MONGO_USER`**, **`MONGO_PASSWORD`**, **`MONGO_CLUSTER`**, and optionally **`MONGO_DB`**, as implemented in `getDbURL()` in that file.

Optional environment variables used in the backend code (with built-in defaults if unset): **`PORT`**, **`NODE_ENV`**, **`SECRET`** (JWT), **`COOKIESECRET`**, **`SALTROUNDS`** — see `Backend/config/config.js`, `Backend/utils/jwt.js`, `Backend/config/express.js`, and `Backend/models/userModel.js`.

---

## Installation

The repository root contains two independent npm projects.

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

---

## Running the project (development)

You need **two terminals**: start the API first, then the Angular dev server.

### 1. Start the API (default port 3000)

From the `Backend/` folder:

```bash
npm start
```

This script runs `node .` (entry `Backend/index.js`). The port is `process.env.PORT` or **3000** (see `Backend/config/config.js`). The console should print something like `Listening on port 3000!` when startup succeeds and MongoDB is available.

**Development CORS:** `Backend/config/config.js` allows `http://localhost:4200`, matching the Angular dev server.

### 2. Start the Angular frontend

From the `Frontend/` folder:

```bash
npm start
```

This is equivalent to **`ng serve`**. The project uses **`proxy.conf.json`**: paths starting with **`/api`** and **`/uploads`** are forwarded to **`http://localhost:3000`**, so the browser can use `http://localhost:4200` while relative requests to `/api/...` reach the local backend.

Open **`http://localhost:4200/`** in the browser (default `ng serve` port; if it is in use, the CLI will pick another port — use the URL shown in the terminal).

### Recommended order

1. Start MongoDB (if you use the default local URI).
2. `npm start` in `Backend/`.
3. `npm start` in `Frontend/`.

---

## Other useful commands (Frontend)

Defined in `Frontend/package.json`:

- `npm run build` — production build (`ng build`).
- `npm run test` — unit tests (`ng test`).

---

## Repository layout

- **`Frontend/`** — Angular application (CLI 21.x per `Frontend/package.json` and `angular.json`).
- **`Backend/`** — Express API; `npm start` runs `node .`.
