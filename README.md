# Issue Tracker System

A web application for teams to **report, assign, track and discuss issues**, built with the **MERN stack** (MongoDB, Express, React, Node.js).

| | |
|---|---|
| **Live demo** | https://issue-tracker-two-xi.vercel.app/ |
| **Source code** | https://github.com/FarzanaAbbas/issue-tracker |
| **Demo login** | `demo@issuetracker.dev` / `demo1234` |
| **Admin login** | `admin@issuetracker.dev` / `admin1234` |

Two more demo users are available, `alex@issuetracker.dev` and `sam@issuetracker.dev`, with the same password. You can also register a new account.

---

## Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Tech stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Folder structure](#5-folder-structure)
6. [Run it locally](#6-run-it-locally)
7. [Environment variables](#7-environment-variables)
8. [API reference](#8-api-reference)
9. [Database design](#9-database-design)
10. [Deployment](#10-deployment)
11. [Security](#11-security)

---

## 1. Overview

Teams often track problems in emails, chats or spreadsheets, and lose track of **who owns what** and **what state it is in**. This app gives the team one shared place to:

- log every issue with a title, description and priority
- assign it to a team member
- move it through **Open → In Progress → Closed**
- discuss it in comments
- see the overall workload on a dashboard

---

## 2. Features

### User accounts
- Register with name, email and password
- Log in and log out
- Stay logged in for 7 days, with a secure cookie session
- Pages are protected, so logged-out users are sent to the login page

### Issues
- **Create** an issue with title, description, status, priority and assignee
- **Edit** any field of an issue
- **Delete** an issue. Only the person who reported it can do this, and must confirm first.
- **Search** by text, **filter** by status, priority or assignee, and **sort** by date

### Assignment
- Assign an issue to any registered user
- Use the **Assign to me** shortcut
- Leave an issue **Unassigned**

### Status tracking
- Every issue is **Open**, **In Progress** or **Closed**
- Change the status with **one click** on the issue page
- Statuses are shown as color-coded badges everywhere

### Comments
- Add comments to any issue
- Comments are shown as a timeline with names and times
- Authors can delete their own comments

### Dashboard
- Counts of **total**, **open**, **in-progress** and **closed** issues
- **My work**: issues assigned to me, issues reported by me, and unassigned issues
- A breakdown by **priority** and the **resolution rate**
- **Recently updated** issues
- Every count opens the matching filtered list

### Admin panel
Admins see an extra **Admin panel** section in the sidebar:
- **Overview**: user and issue totals, a chart of issues created per day (last 14 days), the status mix, team workload per member, and recent sign-ups
- **Users**: search and filter users, **make or remove admins**, **deactivate or reactivate** accounts, and **delete** users
- **Manage issues**: select issues and **change their status** or **delete** them in bulk
- Admins can also delete any issue or comment

Safety rules:
- An admin cannot demote, deactivate or delete themselves
- The last active admin cannot be removed
- Deactivated users are signed out and cannot log in

### User interface
- A formal design with a navy sidebar and a split-screen login page
- Works on **desktop, tablet and mobile**
- Toast messages, confirmation dialogs, and loading and empty states

---

## 3. Tech stack

| Part | Technology |
|---|---|
| **M**: Database | MongoDB Atlas + Mongoose |
| **E**: Back end | Express.js (REST API) |
| **R**: Front end | React 18 + Vite, React Router, Tailwind CSS |
| **N**: Runtime | Node.js 18+ |
| Login security | bcrypt (passwords), JWT in an HTTP-only cookie (sessions) |
| Validation | Zod |
| Hosting | Vercel |

**Language:** JavaScript, used for both the front end and the back end.

---

## 4. Architecture

```
   Browser (React app)
          │
          │  HTTPS
          ▼
 ┌──────────────── Vercel ────────────────┐
 │                                        │
 │   React pages   →  served from CDN     │
 │                                        │
 │   /api/* calls  →  Express API         │
 │                    (serverless)        │
 └───────────────────┬────────────────────┘
                     │
                     ▼
              MongoDB Atlas
```

**How it works**

1. The **React app** shows the pages and calls the API using Axios.
2. The **Express API** checks the login cookie, validates the data, and reads or writes the database.
3. **MongoDB Atlas** stores users, issues and comments.
4. The front end and API share **one domain**, so the login cookie works without extra setup.

**Who can do what**

| Action | Allowed for |
|---|---|
| View, create, edit, assign, change status | Any logged-in user |
| Delete an issue | The person who reported it, or an admin |
| Delete a comment | The person who wrote it, or an admin |
| Use the admin panel (users, bulk actions, stats) | Admins only |

---

## 5. Folder structure

```
issue-tracker-mern/
│
├── api/index.js          → Vercel entry point for the API
│
├── server/               → BACK END (Express + MongoDB)
│   ├── app.js            → Express app setup
│   ├── index.js          → Starts the server locally
│   ├── seed.js           → Adds demo data
│   ├── config/           → Database connection
│   ├── models/           → User, Issue, Comment
│   ├── controllers/      → Logic for each feature
│   ├── routes/           → API URLs
│   ├── middleware/       → Login check, error handling
│   └── utils/            → Validation rules, helpers
│
├── client/               → FRONT END (React)
│   └── src/
│       ├── pages/        → Login, Register, Dashboard, Issues, Issue detail
│       ├── components/   → Sidebar, forms, badges, dialogs
│       ├── context/      → Login state, toast messages
│       └── api/          → API client (Axios)
│
├── docs/BRD.md           → Business Requirements Document
├── vercel.json           → Vercel settings
└── .env.example          → Template for environment variables
```

---

## 6. Run it locally

### You need
- **Node.js 18 or newer**
- A **MongoDB** database: a free MongoDB Atlas cluster, or MongoDB installed locally

### Steps

**Step 1: Install**
```bash
git clone https://github.com/YOUR-USERNAME/issue-tracker-mern.git
cd issue-tracker-mern
npm run install:all
```

**Step 2: Add settings.** Copy `.env.example` to a new file called `.env`, then fill in your values (see [section 7](#7-environment-variables)).

**Step 3: Add demo data (optional)**
```bash
npm run seed
```

**Step 4: Start the app**
```bash
npm run dev
```

**Step 5:** Open **http://localhost:5173** in your browser.

### All commands

| Command | What it does |
|---|---|
| `npm run install:all` | Installs all packages (server + client) |
| `npm run dev` | Starts the API and the React app together |
| `npm run seed` | Adds demo users, issues and the admin account |
| `npm run make-admin -- you@example.com` | Makes an existing account an admin |
| `npm run demo:clear` | Removes the demo users and their issues |
| `npm run build` | Builds the React app for production |
| `npm start` | Starts the API server only |

---

## 7. Environment variables

Create a `.env` file in the project folder:

```env
MONGODB_URI="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/issue_tracker?retryWrites=true&w=majority"
JWT_SECRET="any-long-random-text-of-32-or-more-characters"
PORT=5000
```

| Variable | Required | Meaning |
|---|---|---|
| `MONGODB_URI` | Yes | The MongoDB connection string |
| `JWT_SECRET` | Yes | A secret key used to sign login sessions |
| `ADMIN_EMAILS` | No | Comma-separated emails that become admins when they register or log in |
| `PORT` | No | The local API port (default 5000) |

> **Tip:** generate a strong secret with
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> **Never upload `.env` to GitHub.** It is already excluded in `.gitignore`.

---

## 8. API reference

- **Base URL:** `/api`
- **Format:** JSON
- **Login:** handled automatically by a secure cookie after you log in
- **Errors** always look like `{ "error": "message" }`

### Authentication

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account and log in |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the logged-in user |

### Issues

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/issues` | List issues (with filters) |
| POST | `/api/issues` | Create an issue |
| GET | `/api/issues/:id` | Get one issue |
| PATCH | `/api/issues/:id` | Update an issue (fields, status, assignee) |
| DELETE | `/api/issues/:id` | Delete an issue (reporter only) |

**Filters for the issue list** (optional, can be combined):

| Filter | Example |
|---|---|
| By status | `?status=OPEN` (also `IN_PROGRESS`, `CLOSED`) |
| By priority | `?priority=HIGH` (also `MEDIUM`, `LOW`) |
| Assigned to me | `?assignee=me` |
| Unassigned | `?assignee=unassigned` |
| Reported by me | `?reporter=me` |
| Search text | `?q=login` |
| Sort | `?sort=oldest` or `?sort=updated` |

### Comments

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/issues/:id/comments` | List the comments on an issue |
| POST | `/api/issues/:id/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment (author only) |

### Other

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/users` | List users (for assigning) |
| GET | `/api/dashboard` | Get the dashboard counts |
| GET | `/api/health` | Check that the server is running |

### Admin (admins only, otherwise `403`)

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Totals, issues per day, status mix, team workload, recent sign-ups |
| GET | `/api/admin/users` | List users with issue counts (`?q=`, `?role=admin|user`, `?status=active|deactivated`) |
| PATCH | `/api/admin/users/:id` | Change `role` (`user` / `admin`) or `active` (`true` / `false`) |
| DELETE | `/api/admin/users/:id` | Delete a user, their reported issues and their comments |
| POST | `/api/admin/issues/bulk` | `{ ids, action: "status", status }` or `{ ids, action: "delete" }` |

### Example: create an issue

**Request:** `POST /api/issues`
```json
{
  "title": "Login button not working",
  "description": "Nothing happens when I click Login.",
  "priority": "HIGH",
  "assigneeId": "6ac22391462e55370946e519"
}
```

**Response:** `201 Created`
```json
{
  "issue": {
    "id": "6ac223a648abfd775ea91c20",
    "title": "Login button not working",
    "status": "OPEN",
    "priority": "HIGH",
    "reporter": { "id": "...", "name": "Demo User" },
    "assignee": { "id": "...", "name": "Alex Developer" },
    "commentCount": 0,
    "createdAt": "2026-10-04T10:00:00.000Z"
  }
}
```

### Status codes

| Code | Meaning |
|---|---|
| 200 / 201 | Success |
| 400 | Invalid input |
| 401 | Not logged in |
| 403 | Not allowed |
| 404 | Not found |
| 409 | Email already registered |
| 500 | Server error |

---

## 9. Database design

The database has three collections.

**User**
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Unique |
| password | String | Stored encrypted (bcrypt) |
| role | String | `user` or `admin` |
| active | Boolean | `false` = deactivated (cannot log in) |

**Issue**
| Field | Type | Notes |
|---|---|---|
| title | String | Required |
| description | String | Optional |
| status | String | `OPEN`, `IN_PROGRESS` or `CLOSED` |
| priority | String | `LOW`, `MEDIUM` or `HIGH` |
| reporter | User reference | The person who created the issue |
| assignee | User reference | Can be empty (unassigned) |

**Comment**
| Field | Type | Notes |
|---|---|---|
| body | String | The comment text |
| issue | Issue reference | The issue it belongs to |
| author | User reference | The person who wrote it |

All records also have `createdAt` and `updatedAt` dates. Deleting an issue also deletes its comments.

---

## 10. Deployment

**Hosting:** Vercel (app) + MongoDB Atlas (database)

### Step 1: Set up the database
1. Create a free cluster on **MongoDB Atlas**.
2. Add a **database user** (username + password).
3. In **Network Access**, allow `0.0.0.0/0`.
4. Copy the **connection string**.

### Step 2: Upload the code to GitHub
```bash
git remote add origin https://github.com/YOUR-USERNAME/issue-tracker-mern.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to **vercel.com → Add New → Project**.
2. Import the GitHub repository.
3. Add the environment variables `MONGODB_URI` and `JWT_SECRET`.
4. Click **Deploy**.

### Step 4: Check it works
- Open `https://YOUR-PROJECT.vercel.app/api/health`. It should show `{"ok":true}`.
- Open the main URL and log in.

### Updating the app
Push new code to GitHub, and **Vercel redeploys automatically**.

See [`docs/BRD.md`](docs/BRD.md) for the full deployment guide.

---

## 11. Security

- Passwords are **encrypted** with bcrypt and never sent back by the API.
- Login sessions use a **secure HTTP-only cookie**, which page scripts cannot read.
- All input is **validated** on the server.
- Permissions are **checked on the server**, not only in the UI.
- Search input is **sanitized** to prevent database injection.
