# Fruit Counter

A small demo app that showcases a minimal Node + Express backend with JWT authentication and a static frontend UI for browsing fruits and managing a simple cart. This repository contains a backend API (`backend/`) and a static frontend (`frontend/`).

---

## Project Structure

- `backend/` - Express server, MongoDB (Mongoose) models, authentication routes
  - `server.js` - main server file (ES module)
  - `package.json` - backend dependencies & scripts
- `frontend/` - static UI
  - `index.html` - single page application (vanilla JS)

---

**Tech Stack**

- Backend: Node.js (ES modules), Express, Mongoose, bcrypt, jsonwebtoken
- Frontend: Plain HTML/CSS/JavaScript (no build step)
- Database: MongoDB (local or remote)

---

## Prerequisites

- Node.js (recommended v18+)
- npm (comes with Node.js)
- MongoDB (local or hosted). If you don't have MongoDB running locally, you can use a hosted MongoDB Atlas URI.

---

## Backend — Setup & Run

1. Change into the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional) to override defaults. Supported environment variables:

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/fruitcounter
JWT_SECRET=your_jwt_secret_here
```

4. Start the server in development mode (uses `nodemon`):

```bash
npm run dev
```

By default the backend listens on `http://localhost:4000`.

---

## Frontend — Run

The frontend is a single static file located at `frontend/index.html`.

- Easiest: open `frontend/index.html` directly in your browser.
- Or serve it with a simple static server (recommended to avoid mixed-content or CORS issues):

```bash
# from repository root
cd frontend
# using Python's simple HTTP server
python3 -m http.server 5000
# then visit http://localhost:5000
```

The frontend expects the backend API at `http://localhost:4000/api` by default. If your backend runs at a different origin, update the `API_BASE` constant in `frontend/index.html`.

---

## Environment & Config Notes

- The backend file `server.js` has default fallbacks when environment variables are not provided. Setting `MONGO_URI` and `JWT_SECRET` is recommended for production.
- The frontend stores authentication state and cart in `localStorage` under the keys `user`, `token`, and `cart`.

---

## API Endpoints

All endpoints are rooted at `/api`.

- `GET /api/fruits`
  - Returns the in-memory list of fruits (id, name, price, stock).

- `POST /api/register`
  - Request JSON: `{ name?, email, password }`
  - Creates a user, returns `{ message, token, user }` on success.

- `POST /api/login`
  - Request JSON: `{ email, password }`
  - Returns `{ message, token, user }` on success.

- `GET /api/me` (protected)
  - Requires `Authorization: Bearer <token>` header. Returns the authenticated user's public info.

- `POST /api/cart/add/:id`
  - Decrements the in-memory fruit stock for the given `id` (if > 0) and returns the updated fruit.
  - Optionally accepts `Authorization` header if you want to call it as an authenticated user.

Notes:
- Authentication uses JWTs issued with `JWT_SECRET`. Tokens expire in 7 days by default.
- Passwords are stored as bcrypt hashes in the `User` collection.

Example `curl` (register):

```bash
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"s3cret"}'
```

Example `curl` (login):

```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"s3cret"}'
```

---

## Frontend Behavior & Notes

- The UI fetches fruit data from `GET /api/fruits` and renders product cards.
- Clicking `Add` attempts to call `POST /api/cart/add/:id` and then updates the client-side cart and stock display.
- Cart and auth data persist in `localStorage`:
  - `user`: stored user info
  - `token`: JWT string
  - `cart`: array of cart items `{id,name,price,qty}`
- Login and registration dialogs interact with `/api/login` and `/api/register` and store the returned token and user.

---

## Troubleshooting

- If `npm install` fails, check `backend/package.json` for typos or conflicting packages.
- If the frontend can't reach the backend, ensure the backend is running and the `API_BASE` URL in `frontend/index.html` is correct.
- If MongoDB connection fails, verify `MONGO_URI` and that MongoDB is running and accessible.

---

## Next Steps / Improvements

- Persist fruits (and cart) in a database rather than in-memory.
- Add proper cart endpoints (server-side cart model) and checkout flow.
- Add input validation and rate-limiting for public endpoints.

---

## License

No license specified. Add a `LICENSE` file if you want to set a license for this project.

---

If you want, I can also add a small script to serve the frontend, or update `package.json` scripts to run both backend and a static server concurrently.
