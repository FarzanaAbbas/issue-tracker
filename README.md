# Issue Tracker System (MERN)

A full-stack issue tracker built with the **MERN stack**: **M**ongoDB, **E**xpress, **R**eact and **N**ode.js. Team members can register, log issues, assign them to each other, move them through a status workflow (**Open → In Progress → Closed**), discuss them in comments, and see live counts on a dashboard.

**Live demo:** https://YOUR-PROJECT.vercel.app  <!-- replace after deploying -->
**Repository:** https://github.com/YOUR-USERNAME/issue-tracker-mern  <!-- replace after pushing -->

> **Demo accounts** (available once the seed script has been run against the database):
> `demo@issuetracker.dev`, `alex@issuetracker.dev`, `sam@issuetracker.dev`, all with the password `demo1234`.
> You can also register a new account.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project structure](#project-structure)
5. [Getting started (local setup)](#getting-started-local-setup)
6. [Environment variables](#environment-variables)
7. [Available scripts](#available-scripts)
8. [API reference](#api-reference)
9. [Data model](#data-model)
10. [Deployment](#deployment)
11. [Security notes](#security-notes)

---

## Features

| Feature | Details |
| --- | --- |
| **User registration and login** | Sign up with email and password. Input is validated, passwords are hashed with bcrypt, and sessions use a JWT stored in an HTTP-only cookie for 7 days. Logging out clears the session. |
| **Create, edit and delete issues** | Each issue has a title, description, status and priority. Any team member can edit an issue, but only the issue's **reporter** can delete it (its comments are deleted with it). Deleting asks for confirmation in a dialog. |
| **Assign issues to users** | Assign an issue to any registered user from the form or straight from the issue page, use the *Assign to me* shortcut, or leave it *Unassigned*. |
| **Status tracking** | Each issue is `Open`, `In Progress` or `Closed`, changed with one click using the status control on the issue page. Each issue also has a priority: `Low`, `Medium` or `High`. |
| **Comments** | Every issue has a timeline of comments with author avatars and relative times. Authors can delete their own comments. |
| **Dashboard with counts** | Shows totals for open, in-progress and closed issues (with percentages), *My work* (assigned to me, reported by me, unassigned), a breakdown by priority, the resolution rate and recently updated issues. Every count links to the matching filtered list. |
| **Issue list** | Search by text, filter by status, priority and assignee, and sort the results. Filters are stored in the URL, so a filtered view can be shared or bookmarked. The sidebar has *quick filters*. |
| **Formal, responsive UI** | A navy sidebar layout with a split-screen sign-in page, a consistent design system, avatars, status badges with colored dots, toast notifications, confirmation dialogs, and loading and empty states. Works on desktop, tablet and mobile (the sidebar becomes a drawer). |

## Tech stack

| Layer | Technology |
| --- | --- |
| **M**: Database | MongoDB (hosted on [MongoDB Atlas](https://www.mongodb.com/atlas) in production), accessed through **Mongoose 8** |
| **E**: API | **Express 4** REST API, with request validation using [Zod](https://zod.dev) |
| **R**: Front end | **React 18**, built with **Vite 5**, using React Router 6, Axios, Tailwind CSS 3 and lucide-react icons |
| **N**: Runtime | **Node.js** 18 or later |
| Authentication | `bcryptjs` for password hashing and `jsonwebtoken` for JWTs, sent in an HTTP-only cookie (via `cookie-parser`) |
| Hosting | [Vercel](https://vercel.com): the React build is served from the CDN and the Express app runs as a serverless function |

## Architecture

```
                   ┌───────────────────────────── Vercel ──────────────────────────────┐
  Browser          │                                                                    │
  React SPA ─────► │  CDN: client/dist (index.html, JS, CSS)                            │
  (React Router)   │                                                                    │
      │  Axios     │  /api/*  ──rewrite──►  api/index.js  (serverless Node function)    │
      └──────────► │                          └─ Express app (server/app.js)            │
                   │                               ├─ cookie-parser, express.json       │
                   │                               ├─ connectDB() (cached connection)   │
                   │                               ├─ routes → requireAuth → controllers│
                   │                               └─ error middleware → { error }      │
                   └───────────────────────────────────────┬────────────────────────────┘
                                                           ▼
                                                 MongoDB Atlas (Mongoose)
```

- **Front end and back end.** The React single-page app in `client/` talks to the Express REST API in `server/` using Axios. Because both are served from the **same origin**, the session cookie works without any CORS setup. In development, Vite proxies `/api` to the Express server, and in production Vercel rewrites `/api/*` to the serverless function.
- **One Express app, two entry points.** `server/app.js` builds the Express app. `api/index.js` exports it as a Vercel serverless function, and `server/index.js` runs it as a normal server for local development or any Node host (in production it also serves the React build).
- **Authentication.** Logging in checks the password against its bcrypt hash, then signs a JWT whose `sub` is the user's id and sets it as an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production). The `requireAuth` middleware verifies the token and loads the user into `req.user`. In the React app, `AuthContext` restores the session on load with `GET /api/auth/me`, and route guards protect the pages.
- **Authorization rules**, enforced on the server:
  - Any logged-in user can view, create, edit, assign, and change the status of any issue.
  - Only an issue's reporter can delete it.
  - Only a comment's author can delete that comment.
- **Database connection.** Mongoose connects once and the connection is cached on `globalThis`, so warm serverless calls reuse it. The dashboard counts are calculated by MongoDB aggregation pipelines that run in parallel.
- **Error handling.** Async handlers are wrapped so that thrown errors reach a single error middleware. It returns `400` for validation errors and bad JSON, `404` for invalid ids, `409` for duplicates and `500` for anything else. The body is always `{ "error": "..." }`.

## Project structure

```
issue-tracker-mern/
├── api/
│   └── index.js                 # Vercel serverless entry (exports the Express app)
├── server/                      # Express + Mongoose back end
│   ├── app.js                   # Express app: middleware, /api routes, error handling
│   ├── index.js                 # Standalone server (local dev / any Node host)
│   ├── seed.js                  # Demo users, issues and comments
│   ├── config/db.js             # Cached MongoDB connection
│   ├── models/                  # User, Issue, Comment Mongoose schemas
│   ├── controllers/             # auth, user, issue, comment, dashboard logic
│   ├── routes/index.js          # REST route definitions
│   ├── middleware/              # requireAuth, error handlers
│   └── utils/                   # Zod validators, HttpError, asyncHandler
├── client/                      # React front end (Vite)
│   ├── index.html
│   ├── vite.config.js           # Dev proxy /api → Express
│   ├── tailwind.config.js       # Design tokens (navy "ink" + "brand" palette, fonts)
│   └── src/
│       ├── main.jsx, App.jsx    # Providers and routes
│       ├── api/client.js        # Axios instance
│       ├── context/             # AuthContext, ToastContext
│       ├── components/          # Layout (sidebar), IssueForm, badges, dialogs, ...
│       ├── hooks/useUsers.js
│       ├── lib/format.js        # Labels and date helpers
│       └── pages/               # Login, Register, Dashboard, Issues, IssueDetail, ...
├── docs/BRD.md                  # Business Requirements Document (incl. Deployment)
├── vercel.json                  # Build output and rewrites for Vercel
├── .env.example
└── package.json                 # Server dependencies and root scripts
```

## Getting started (local setup)

### Prerequisites

- **Node.js 18.18 or later** (Node 20 LTS recommended) and npm
- A **MongoDB** database. Any of these works:
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (nothing to install), or
  - Docker: `docker run -d --name issue-mongo -p 27017:27017 mongo:7`, or
  - a local MongoDB Community Server

### Steps

```bash
# 1. Clone the repository and install the server and client dependencies
git clone https://github.com/YOUR-USERNAME/issue-tracker-mern.git
cd issue-tracker-mern
npm run install:all

# 2. Configure the environment
cp .env.example .env        # then edit MONGODB_URI and JWT_SECRET

# 3. (Optional) Load demo data
npm run seed

# 4. Run the API and the React app together
npm run dev
#   API:   http://localhost:5000
#   React: http://localhost:5173   ← open this one
```

For a local MongoDB server, `.env` might look like this:

```env
MONGODB_URI="mongodb://127.0.0.1:27017/issue_tracker"
JWT_SECRET="any-long-random-string-at-least-32-characters"
PORT=5000
```

To run a production build locally on a single port: `npm run build && NODE_ENV=production npm start`, then open http://localhost:5000.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string, for example `mongodb+srv://user:pass@cluster.mongodb.net/issue_tracker`. |
| `JWT_SECRET` | Yes | Secret used to sign session tokens. Use a random string of 32 or more characters, for example from `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Changing it signs out every user. |
| `PORT` | No | Port for the standalone Express server (default `5000`). Not used on Vercel. |
| `NODE_ENV` | No | Set to `production` to mark cookies `Secure` and to make `server/index.js` serve the React build. Vercel sets this automatically. |
| `API_PORT`, `CLIENT_PORT` | No | Development only: the API port the Vite proxy targets (default `5000`) and the Vite port (default `5173`). |

Never commit `.env`. It is listed in `.gitignore`.

## Available scripts

Run these from the project root:

| Script | Description |
| --- | --- |
| `npm run install:all` | Install the server dependencies (root) and the client dependencies (`client/`) |
| `npm run dev` | Run the Express API (with auto-restart) and the Vite dev server together |
| `npm run dev:server` / `npm run dev:client` | Run only one of them |
| `npm run build` | Install the client dependencies and build the React app into `client/dist` (Vercel uses this) |
| `npm start` | Start the Express server |
| `npm run seed` | Insert demo users and issues (safe to re-run) |

## API reference

The base URL is `/api`. Requests and responses are JSON. Authentication uses the `it_session` HTTP-only cookie, which is set by register and login. With curl, keep cookies between requests using `-c cookies.txt -b cookies.txt`.

Errors always look like `{ "error": "message" }`, with one of these status codes:

| Status | Meaning |
| --- | --- |
| `400` | Validation error or invalid JSON |
| `401` | Not logged in |
| `403` | Not allowed |
| `404` | Not found |
| `409` | Conflict (for example, the email is already registered) |
| `500` | Server error |

### Auth

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | `201 { user }` and sets the cookie. `409` if the email already exists. |
| `POST` | `/api/auth/login` | `{ email, password }` | `200 { user }` and sets the cookie. `401` for invalid credentials. |
| `POST` | `/api/auth/logout` | none | `{ ok: true }` and clears the cookie |
| `GET` | `/api/auth/me` | none | `{ user }`, or `401` if not logged in |

Validation rules for register: the name needs at least 2 characters, the email must be valid, and the password needs at least 6 characters.

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/users` | `{ users: [{ id, name, email }] }`: the people an issue can be assigned to |

### Issues

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/issues` | List issues as `{ issues }`. Accepts the optional query parameters below. |
| `POST` | `/api/issues` | Create an issue. Body: `{ title, description?, status?, priority?, assigneeId? }`. The reporter is the current user. Returns `201 { issue }`. |
| `GET` | `/api/issues/:id` | `{ issue }`, or `404` |
| `PATCH` | `/api/issues/:id` | Partial update with any of `{ title, description, status, priority, assigneeId }`. Send `assigneeId: null` to unassign. Returns `{ issue }`. |
| `DELETE` | `/api/issues/:id` | Delete an issue and its comments. **Reporter only.** |

Query parameters for `GET /api/issues`:

| Parameter | Values |
| --- | --- |
| `status` | `OPEN`, `IN_PROGRESS` or `CLOSED` |
| `priority` | `LOW`, `MEDIUM` or `HIGH` |
| `assignee` | `me`, `unassigned`, or a user id |
| `reporter` | `me` |
| `q` | Text to search for in the title and description (case-insensitive) |
| `sort` | `newest` (default), `oldest` or `updated` |

`Issue` object:

```json
{
  "id": "6ac22391d36dad550066150f",
  "title": "Login page crashes on empty password",
  "description": "Steps to reproduce...",
  "status": "OPEN",
  "priority": "HIGH",
  "reporter": { "id": "...", "name": "Sam Tester", "email": "sam@issuetracker.dev" },
  "assignee": { "id": "...", "name": "Alex Developer", "email": "alex@issuetracker.dev" },
  "commentCount": 2,
  "createdAt": "2026-10-04T09:00:00.000Z",
  "updatedAt": "2026-10-04T09:30:00.000Z"
}
```

### Comments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/issues/:id/comments` | `{ comments: [{ id, body, author, createdAt }] }`, oldest first |
| `POST` | `/api/issues/:id/comments` | Body `{ body }` (1–2000 characters). Returns `201 { comment }`. |
| `DELETE` | `/api/comments/:id` | Delete a comment. **Author only.** |

### Dashboard

`GET /api/dashboard` returns the counts the dashboard displays:

```json
{
  "total": 12,
  "byStatus":   { "OPEN": 5, "IN_PROGRESS": 4, "CLOSED": 3 },
  "byPriority": { "LOW": 3, "MEDIUM": 5, "HIGH": 4 },
  "assignedToMe": 4,
  "assignedToMeOpen": 3,
  "reportedByMe": 6,
  "unassigned": 2,
  "recent": [ /* the 5 most recently updated issues */ ]
}
```

### Health check

`GET /api/health` returns `{ ok: true }`.

### Example session with curl

```bash
B=http://localhost:5000/api
curl -c c.txt -H "Content-Type: application/json" \
     -d '{"email":"demo@issuetracker.dev","password":"demo1234"}' $B/auth/login
curl -b c.txt -H "Content-Type: application/json" \
     -d '{"title":"Broken save button","priority":"HIGH"}' $B/issues
curl -b c.txt "$B/issues?status=OPEN&assignee=me"
curl -b c.txt $B/dashboard
```

## Data model

There are three collections: `users`, `issues` and `comments`.

| Model | Fields |
| --- | --- |
| **User** | `name`, `email` (unique, stored lowercase), `password` (bcrypt hash, never returned by the API), `createdAt`, `updatedAt` |
| **Issue** | `title`, `description`, `status` (`OPEN`, `IN_PROGRESS` or `CLOSED`), `priority` (`LOW`, `MEDIUM` or `HIGH`), `reporter` (ObjectId → User), `assignee` (ObjectId → User, or null), `createdAt`, `updatedAt` |
| **Comment** | `body`, `issue` (ObjectId → Issue), `author` (ObjectId → User), `createdAt`, `updatedAt` |

Indexes on `Issue.status`, `Issue.assignee`, `Issue.reporter` and `Comment.issue` speed up the filter and dashboard queries. When an issue is deleted, its comments are deleted too.

## Deployment

The app is deployed on **Vercel**, and its database is **MongoDB Atlas**. The full Deployment section is in [`docs/BRD.md`](docs/BRD.md#9-deployment). The short version:

1. Create a free **MongoDB Atlas** cluster:
   - Add a database user.
   - Under **Network Access**, allow `0.0.0.0/0`. This is needed because Vercel's serverless functions don't use fixed IP addresses.
   - Copy the connection string.
2. Push this repository to GitHub.
3. In Vercel, choose **Add New → Project** and import the repository. The build settings come from `vercel.json`.
4. Under **Environment Variables**, add `MONGODB_URI` and `JWT_SECRET`, then click **Deploy**.
5. (Optional) Seed demo data from your machine by running `npm run seed` with `MONGODB_URI` set to the Atlas connection string.

After that, every push to `main` redeploys production, and every pull request gets its own preview URL.

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) and are excluded from every query result and API response.
- The session JWT is kept in an `HttpOnly` cookie, so page scripts can't read it. The cookie is `SameSite=Lax`, which protects requests that change data from CSRF, and it is `Secure` in production.
- Every request that writes data is validated with Zod, and the permission rules are checked on the server.
- Text searches are regex-escaped, and ids are validated before they reach a query, which prevents NoSQL injection and stops malformed ids from causing server errors.
- The JSON body size is limited to 100 KB, and the `x-powered-by` header is disabled.
