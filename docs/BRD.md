# Business Requirements Document (BRD)

## Issue Tracker System (MERN Stack)

| Item | Value |
| --- | --- |
| Document version | 1.0 |
| Date | 4 October 2026 |
| Author | Farzana Abbas |
| Live application | https://YOUR-PROJECT.vercel.app |
| Source code | https://github.com/YOUR-USERNAME/issue-tracker-mern |

---

## 1. Purpose

This document defines the business and functional requirements, the solution design, and the deployment approach for the **Issue Tracker System**. The system is a web application that lets a team record problems or tasks (called *issues*), assign them to people, track their progress, and discuss them in one place.

## 2. Background and problem statement

Teams that track issues through email threads, chat messages or spreadsheets lose context. It becomes hard to tell who owns an issue, what state it is in, and how much work is still outstanding. The team needs a single shared tool, available at any time, that:

- records each issue with a clear owner and status,
- keeps the discussion attached to the issue, and
- shows a quick summary of the team's workload.

## 3. Objectives

| # | Objective | Success measure |
| --- | --- | --- |
| O1 | Give every team member a secure personal account | Users can register, log in and log out. The application's data is available only to authenticated users. |
| O2 | Keep all issue records in one place | Issues can be created, viewed, edited and deleted in the application |
| O3 | Make ownership explicit | Every issue can be assigned to a registered user or left unassigned |
| O4 | Make progress visible | Every issue has a status (Open, In Progress or Closed) that can be changed in one click |
| O5 | Keep discussion in context | Users can comment on any issue |
| O6 | Summarize the team's workload | A dashboard shows live counts by status, priority and ownership |
| O7 | Make the application available online | The application is deployed on Vercel, and the deployment process is documented |

## 4. Scope

### 4.1 In scope

- User registration, login, logout and session management
- Creating, reading, updating and deleting issues
- Assigning issues to users
- A status workflow of Open → In Progress → Closed. Any transition is allowed, including reopening a closed issue.
- An issue priority of Low, Medium or High
- Comments on issues
- A dashboard with aggregate counts
- Searching, filtering and sorting issues
- An admin panel: system overview, user and role management, and bulk issue actions
- A formal, responsive user interface
- Cloud deployment and project documentation

### 4.2 Out of scope (possible future enhancements)

- Multiple projects or workspaces
- Email or real-time notifications
- File attachments
- Password reset by email, and OAuth or social login
- A per-issue audit trail
- Labels, due dates and sprints

## 5. Stakeholders and user roles

| Role | Description | Permissions |
| --- | --- | --- |
| Visitor | Someone who is not logged in | Can open only the sign-in and registration pages |
| Team member | Any authenticated user | Can view all issues and the dashboard, and create issues. Can edit any issue's title, description, status, priority and assignee, and comment on any issue. |
| Reporter | The team member who created a particular issue | Has every team member permission, and can also **delete** that issue |
| Comment author | The team member who wrote a particular comment | Can **delete** that comment |
| Admin | A team member with the admin role | Everything a team member can do, plus access to the **admin panel**: view system statistics, manage users (roles, deactivation, deletion), change or delete issues in bulk, and delete any issue or comment |

## 6. Functional requirements

### 6.1 User registration and login

| ID | Requirement |
| --- | --- |
| FR-1.1 | A visitor can register with a full name (at least 2 characters), an email address, and a password (at least 6 characters) that is entered twice to confirm it. |
| FR-1.2 | Each email address can be registered only once, and the check ignores letter case. Trying to register an existing email shows "An account with this email already exists". |
| FR-1.3 | After registering, the user is logged in automatically and taken to the dashboard. |
| FR-1.4 | Users log in with their email and password. Wrong credentials show "Invalid email or password", without saying which of the two was wrong. A *show password* toggle is available. |
| FR-1.5 | A session lasts 7 days, or until the user logs out. |
| FR-1.6 | A visitor who opens a protected page is sent to the sign-in page, then returned to the original page after logging in. If a session expires while the user is working, the user is also sent to the sign-in page. |
| FR-1.7 | A logged-in user who opens the sign-in or registration page is sent to the dashboard. |

### 6.2 Issue management

| ID | Requirement |
| --- | --- |
| FR-2.1 | A user can create an issue with a title (required, 3–150 characters), a description (optional, up to 5000 characters), a status (default Open), a priority (default Medium) and an assignee (optional). |
| FR-2.2 | The system records the creator as the issue's **reporter**, along with when the issue was created and last updated. |
| FR-2.3 | Users can view a list of all issues. The list shows each issue's title, number of comments, status, priority, assignee (with avatar), reporter and creation date. |
| FR-2.4 | The list can be searched by text in the title or description. It can be filtered by status, priority and assignee (any user, "me", or unassigned), and sorted by newest, oldest or recently updated. The filters are kept in the URL. The sidebar offers quick filters. |
| FR-2.5 | Users can open an issue to see all of its details and its comments. |
| FR-2.6 | Any user can edit an issue's title, description, status, priority and assignee. |
| FR-2.7 | Only the reporter can delete an issue, after confirming in a dialog. Deleting an issue also deletes its comments. |

### 6.3 Assignment

| ID | Requirement |
| --- | --- |
| FR-3.1 | An issue can be assigned to any registered user, or left unassigned. |
| FR-3.2 | The assignee can be changed directly on the issue page, which also offers an "Assign to me" shortcut. |
| FR-3.3 | The system rejects an assignment to a user who does not exist. |

### 6.4 Status tracking

| ID | Requirement |
| --- | --- |
| FR-4.1 | Every issue has exactly one status: **Open**, **In Progress** or **Closed**. |
| FR-4.2 | The status can be changed in one click on the issue page, or through the edit form. A confirmation message appears after each change. |
| FR-4.3 | Wherever an issue appears, its status is shown as a color-coded badge. |

### 6.5 Comments

| ID | Requirement |
| --- | --- |
| FR-5.1 | Any user can add a comment of 1–2000 characters to any issue. |
| FR-5.2 | Comments appear as a timeline, oldest first, with the author's name and avatar and the time posted. |
| FR-5.3 | The author of a comment can delete it, after confirming. |

### 6.6 Dashboard

| ID | Requirement |
| --- | --- |
| FR-6.1 | The dashboard shows the total number of issues and the number of Open, In Progress and Closed issues, each with its percentage of the total. |
| FR-6.2 | The dashboard shows the current user's workload: active issues assigned to them, all issues assigned to them, issues they reported, and active issues with no assignee. |
| FR-6.3 | The dashboard shows a breakdown by priority, and the resolution rate (the percentage of issues that are closed). |
| FR-6.4 | The dashboard lists the 5 most recently updated issues. |
| FR-6.5 | Each count links to the issue list with the matching filter applied. |

### 6.7 Admin panel

| ID | Requirement |
| --- | --- |
| FR-7.1 | Every user has a role: **User** (default) or **Admin**. The admin panel is a **separate application** with its own URL/port and sign-in page; only admins can sign in, and its session is separate from the user app's. The API rejects requests without an admin session (`401`) or from non-admins (`403`). |
| FR-7.2 | **Overview:** shows the number of users (and new users this week), admins, deactivated accounts, issues and comments; a chart of issues created per day over the last 14 days; the status mix; team workload (open, in-progress and closed issues per assignee); and the five most recent sign-ups. |
| FR-7.3 | **Users:** admins can search users by name or email and filter by role and status. Each row shows the user's role, status, issues reported, open issues assigned and join date. |
| FR-7.4 | Admins can **make a user an admin** or **remove admin access**. |
| FR-7.5 | Admins can **deactivate** a user, after confirming. A deactivated user is signed out within about 30 seconds, cannot log in, and is removed from the assignee list; their issues and comments are kept. Admins can **reactivate** the account. |
| FR-7.6 | Admins can **delete** a user, after confirming. This removes the account, the issues they reported and all of their comments; issues assigned to them become unassigned. |
| FR-7.7 | Safety rules: an admin cannot demote, deactivate or delete their own account, and the last active admin cannot be demoted, deactivated or deleted. |
| FR-7.8 | **Manage issues:** admins can search and filter all issues, select several (or all) and **change their status** or **delete** them in one action, after confirming deletion. |
| FR-7.9 | Admins can delete any issue or comment from the issue page. |
| FR-7.10 | The first admin is created by the seed script (demo admin), by listing emails in the `ADMIN_EMAILS` environment variable, or with `npm run make-admin -- <email>`. |

## 7. Non-functional requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Security | Passwords are stored only as bcrypt hashes. Sessions use signed JWTs in `HttpOnly` cookies that are `SameSite=Lax`, and `Secure` in production. Every API endpoint except register, login and health requires authentication. The permission rules in FR-2.7 and FR-5.3 are enforced on the server. Search input is escaped and ids are validated before use. |
| NFR-2 | Validation | All input is validated on the server with Zod, and validation errors return clear messages. The browser also checks forms before submitting them. |
| NFR-3 | Usability | The interface is formal and consistent, and works on desktop, tablet and mobile. It includes loading states, empty states, toast notifications and confirmation dialogs, and its form fields are labelled for accessibility. |
| NFR-4 | Performance | Dashboard counts come from indexed MongoDB aggregations that run in parallel. The React app is served from a CDN as a single bundle of about 90 KB (gzipped). |
| NFR-5 | Availability | The application runs on Vercel's serverless platform with a managed MongoDB Atlas database, so there are no servers to maintain. |
| NFR-6 | Maintainability | The server uses a conventional MERN structure (models, controllers, routes and middleware). The client is divided into pages, components, contexts and hooks, and the API is documented. |
| NFR-7 | Portability | All configuration comes from environment variables. The application also runs on any Node.js 18 or later host, such as Render, Railway or a VPS. |

## 8. Solution overview

### 8.1 Technology stack (MERN)

| Layer | Choice | Reason |
| --- | --- | --- |
| **M**: MongoDB with Mongoose | MongoDB Atlas (free tier) | A flexible document model that suits issues and comments, offered as a managed cloud service |
| **E**: Express.js | Express 4 REST API | A minimal, widely used Node web framework |
| **R**: React | React 18, Vite, React Router, Tailwind CSS | A fast single-page application with a consistent design system |
| **N**: Node.js | Node 18 or later | One language (JavaScript) across the whole stack |
| Authentication | bcryptjs and jsonwebtoken | A lightweight, standard approach that needs no third-party authentication service |
| Hosting | Vercel | Hosts the React static files and the Express API under a single domain, deploying automatically from Git |

### 8.2 Architecture

```
Browser (React SPA)
   │  HTTPS, with the session cookie on the same origin
   ▼
Vercel
 ├─ CDN ...................... client/dist (the React build)
 └─ /api/* → api/index.js .... Express app: validate → authenticate and authorize → Mongoose
                                     │
                                     ▼
                           MongoDB Atlas (managed cluster)
```

### 8.3 Data model

| Collection | Fields | Relationships |
| --- | --- | --- |
| users | name, email (unique), password (hash), role (user/admin), active, createdAt, updatedAt | A user reports issues, is assigned issues, and writes comments |
| issues | title, description, status, priority, reporter, assignee (nullable), createdAt, updatedAt | `reporter` and `assignee` reference users. Each issue has comments. |
| comments | body, issue, author, createdAt, updatedAt | `issue` references an issue and `author` references a user |

Rule: when an issue is deleted, its comments are deleted too.

### 8.4 API summary

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users | `GET /api/users` |
| Issues | `GET /api/issues`, `POST /api/issues`, `GET /api/issues/:id`, `PATCH /api/issues/:id`, `DELETE /api/issues/:id` |
| Comments | `GET /api/issues/:id/comments`, `POST /api/issues/:id/comments`, `DELETE /api/comments/:id` |
| Dashboard | `GET /api/dashboard` |
| Health | `GET /api/health` |
| Admin | `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`, `GET /api/admin/issues`, `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id`, `POST /api/admin/issues/bulk` |

The [README](../README.md#api-reference) documents every request and response.

---

## 9. Deployment

### 9.1 Where the application is hosted

| Component | Platform | Notes |
| --- | --- | --- |
| React front end | **Vercel** at https://YOUR-PROJECT.vercel.app | The `client/dist` build is served from Vercel's global CDN. All non-API paths fall back to `index.html`, so client-side routing works. |
| Express API | **Vercel serverless function** (`api/index.js`) | `vercel.json` rewrites every `/api/*` request to the Express app. Because the API shares the front end's domain, no CORS setup is needed. |
| Admin panel | **Separate Vercel project** (Root Directory `admin`) at https://issue-tracker-admin-six.vercel.app | A separate React app built from `admin/`. `admin/vercel.json` forwards `/api/*` to the main app, so the admin app uses the same API and database through its own domain and its own admin session cookie. |
| Database | **MongoDB Atlas** (free M0 cluster) | A managed MongoDB service. The API connects to it using `MONGODB_URI`. |
| Source code | **GitHub** at https://github.com/YOUR-USERNAME/issue-tracker-mern | Connected to Vercel for continuous deployment |

### 9.2 Deployment approach

- **Continuous deployment from Git.** The Vercel project is linked to the GitHub repository.
  - Every push or merge to `main` triggers a **production deployment**.
  - Every pull request, and every other branch, gets its own **preview deployment** with a unique URL.
- **Build pipeline**, configured in `vercel.json`:
  1. `npm install` (at the project root) installs the server dependencies used by the serverless function.
  2. `npm run build` installs the client dependencies, then runs `vite build`, which writes the production React bundle to `client/dist`.
  3. Vercel publishes `client/dist` to the CDN and bundles `api/index.js`, along with the `server/` code, as a Node.js serverless function.
  If any step fails, the deployment stops and the previous version stays live.
- **Database connection in a serverless environment.** The Mongoose connection is cached on `globalThis`, so warm function calls reuse it instead of opening a new connection for each request.
- **Releases without downtime.** Vercel switches traffic to a new deployment only once its build has finished. **Instant Rollback** restores any earlier deployment.
- **Configuration through environment variables only.** No secrets are stored in the repository.

### 9.3 Required services and configuration

| Service | Purpose | Plan |
| --- | --- | --- |
| GitHub account and repository | Source control; pushes trigger deployments | Free |
| Vercel account | Hosting, CI/CD, CDN and serverless functions | Hobby (free) |
| MongoDB Atlas account | Managed database | M0 (free) |

| Environment variable (set in Vercel) | Value |
| --- | --- |
| `MONGODB_URI` | The Atlas connection string, for example `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/issue_tracker?retryWrites=true&w=majority` |
| `JWT_SECRET` | A random string of at least 32 characters |
| `ADMIN_EMAILS` (optional) | Comma-separated emails that are made admins when they register or log in |

Vercel sets `NODE_ENV=production` automatically.

### 9.4 Step-by-step: first deployment

1. **Create the database (MongoDB Atlas)**
   1. Sign in at <https://cloud.mongodb.com> and create a free **M0** cluster. Choosing a region near Vercel's default region (Washington, D.C., `iad1`) keeps latency low.
   2. Under **Database Access**, add a database user with a password, and give it the *Read and write to any database* role.
   3. Under **Network Access**, add the IP address `0.0.0.0/0` (*Allow access from anywhere*). This is needed because Vercel's serverless functions don't have fixed IP addresses.
   4. Click **Connect → Drivers** and copy the connection string. Replace `<password>`, and add the database name `issue_tracker` after `.net/`.
2. **Push the code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Issue Tracker System (MERN)"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/issue-tracker-mern.git
   git push -u origin main
   ```
3. **Create the Vercel project.** Sign in at <https://vercel.com>, choose **Add New → Project**, and import the `issue-tracker-mern` repository. Keep the root directory as `./`. The build command and output directory come from `vercel.json`, so set the framework preset to **Other** if Vercel asks.
4. **Add the environment variables.** Under **Environment Variables**, add `MONGODB_URI` and `JWT_SECRET` for the Production, Preview and Development environments. You can generate a secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. **Deploy.** Click **Deploy**. When it finishes, open `https://YOUR-PROJECT.vercel.app/api/health`, which should return `{"ok":true}`.
6. **(Optional) Load the demo data.** From your machine, run:
   ```bash
   MONGODB_URI="<atlas connection string>" npm run seed
   ```
7. **Smoke test.** Open the production URL, then:
   - register a user,
   - create an issue,
   - assign it,
   - change its status,
   - add a comment,
   - and check that the dashboard counts update.

### 9.4b Deploying the admin panel

1. In Vercel, choose **Add New → Project** and import the **same** repository again.
2. Set **Root Directory** to `admin` and **Framework Preset** to **Other**. Build settings come from `admin/vercel.json`.
3. No environment variables are needed. `admin/vercel.json` forwards `/api/*` to the main app (`https://issue-tracker-two-xi.vercel.app`); if the main URL changes, update it there and in `admin/.env.production`.
4. Deploy, open the admin URL and sign in with an admin account. Pushes to `main` redeploy both projects.

### 9.5 Updating the application

| Type of change | Steps |
| --- | --- |
| Code change (UI or API) | Commit and push to `main`, or merge a pull request. Vercel builds and deploys automatically. Check the preview deployment on the pull request before merging. |
| Data model change | Update the Mongoose schema in `server/models/`. MongoDB doesn't need migrations, and new fields should have default values so that existing documents stay valid. If existing data must be transformed, write a one-off script like `server/seed.js` and run it with the production `MONGODB_URI`. |
| Environment variable change | Edit it in **Vercel → Settings → Environment Variables**, then **Redeploy**. Environment variables only take effect in new deployments. |
| Rollback | Go to **Vercel → Deployments**, select an earlier deployment, and choose **Instant Rollback**. |

### 9.6 Deploying elsewhere (alternative)

The Express server can also serve the React build itself, so the application runs on any Node.js host, such as Render, Railway, Fly.io or a VPS:

```bash
npm run install:all
npm run build
NODE_ENV=production MONGODB_URI="..." JWT_SECRET="..." PORT=5000 npm start
```

GitHub Pages is **not** suitable for this project. It serves only static files, and this application needs a running Express API and a database.

---

## 10. Assumptions and constraints

- All users belong to one team and can see every issue. There is no separation between tenants.
- One deployment serves one team. The free tiers of Vercel and Atlas are enough for a small team.
- Users need a modern browser with JavaScript enabled.

## 11. Acceptance criteria

| # | Criterion | Covered by |
| --- | --- | --- |
| AC-1 | A new user can register, is logged in automatically, and can log out and log back in | FR-1.x |
| AC-2 | A user can create, view and edit an issue, and the reporter can delete it | FR-2.x |
| AC-3 | A user can assign an issue to themselves or someone else, or remove the assignee | FR-3.x |
| AC-4 | A user can move an issue between Open, In Progress and Closed | FR-4.x |
| AC-5 | A user can add comments and delete their own | FR-5.x |
| AC-6 | The dashboard counts match the issue data and update after changes | FR-6.x |
| AC-7 | The application is available at the public Vercel URL, and the README and BRD are enough for another developer to run and deploy it | Section 9, README |
| AC-8 | An admin can view the overview, change roles, deactivate/reactivate and delete users, and change or delete issues in bulk; a regular user cannot open the admin panel | FR-7.x |
