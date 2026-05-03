# TaskFlow — Full-Stack Task Management System

A production-grade task management application built with **Next.js 14 App Router**, **TypeScript**, **MongoDB**, and **JWT authentication**.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/signup with HTTP-only cookies
- 🔑 **bcrypt password hashing** — Industry-standard security
- 🛡️ **Middleware-based route protection** — Automatic redirects for unauthenticated users
- ✅ **Full CRUD** — Create, read, update, and delete tasks
- 🎯 **Priority levels** — Low / Medium / High with colour-coded badges
- 📅 **Due dates** with overdue detection
- 👤 **Task assignment** — Assign tasks to any registered user
- 🔍 **Filters** — By status, priority, and assignee
- 📊 **Dashboard stats** — Progress bar, task counts, overdue count
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer        | Technology                    |
|-------------|-------------------------------|
| Frontend    | Next.js 14 App Router + TypeScript |
| Styling     | Tailwind CSS + CSS variables  |
| Backend     | Next.js API Routes            |
| Database    | MongoDB + Mongoose            |
| Auth        | JWT (`jose`) + bcrypt         |

---

## 📁 Project Structure

```
taskflow/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   ├── logout/route.ts     # POST /api/auth/logout
│   │   │   ├── me/route.ts         # GET  /api/auth/me
│   │   │   └── signup/route.ts     # POST /api/auth/signup
│   │   ├── tasks/
│   │   │   ├── [id]/route.ts       # GET / PATCH / DELETE /api/tasks/:id
│   │   │   └── route.ts            # GET / POST /api/tasks
│   │   └── users/route.ts          # GET /api/users
│   ├── dashboard/page.tsx          # Protected dashboard (client)
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   ├── globals.css                 # Design tokens + global styles
│   ├── layout.tsx                  # Root layout + AuthProvider
│   └── page.tsx                    # Root redirect
├── components/
│   ├── layout/Navbar.tsx           # Top navigation bar
│   ├── tasks/
│   │   ├── Filters.tsx             # Filter controls
│   │   ├── StatsBar.tsx            # Dashboard stat cards
│   │   ├── TaskCard.tsx            # Individual task row
│   │   └── TaskModal.tsx           # Create / edit modal
│   └── AuthProvider.tsx            # React auth context
├── lib/
│   ├── api.ts                      # Response helpers (ok / err)
│   ├── auth.ts                     # JWT sign/verify + cookie reader
│   └── mongodb.ts                  # Singleton Mongoose connection
├── models/
│   ├── Task.ts                     # Task Mongoose schema
│   └── User.ts                     # User Mongoose schema
├── types/index.ts                  # Shared TypeScript types
├── middleware.ts                   # Auth middleware (route protection)
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17+
- **npm** 9+ (or yarn / pnpm)
- A **MongoDB** instance — free tier at [MongoDB Atlas](https://cloud.mongodb.com)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
npm install
```

---

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# MongoDB connection string (Atlas or local)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/taskflow

# Strong random secret for JWT signing
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-64-char-random-secret-here
```

---

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🔌 API Reference

All endpoints return `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

### Auth

| Method | Endpoint            | Body                        | Description         |
|--------|---------------------|-----------------------------|---------------------|
| POST   | `/api/auth/signup`  | `{ name, email, password }` | Create account      |
| POST   | `/api/auth/login`   | `{ email, password }`       | Sign in             |
| POST   | `/api/auth/logout`  | —                           | Sign out            |
| GET    | `/api/auth/me`      | —                           | Current user        |

### Tasks

| Method | Endpoint           | Body / Query                | Description         |
|--------|--------------------|-----------------------------|---------------------|
| GET    | `/api/tasks`       | `?status=&priority=`        | List tasks          |
| POST   | `/api/tasks`       | `{ title, description, priority, dueDate, assignedTo }` | Create task |
| GET    | `/api/tasks/:id`   | —                           | Get single task     |
| PATCH  | `/api/tasks/:id`   | Any task fields             | Update task         |
| DELETE | `/api/tasks/:id`   | —                           | Delete task         |

### Users

| Method | Endpoint      | Description              |
|--------|---------------|--------------------------|
| GET    | `/api/users`  | List all users (for assignment dropdown) |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) before storage
- JWTs are stored in **HTTP-only cookies** — inaccessible to JavaScript (XSS safe)
- Cookies use `SameSite=lax` to mitigate CSRF attacks
- The `select: false` Mongoose option ensures passwords are **never returned** in queries by default
- Only task **creators** can edit or delete their tasks; assignees can only toggle completion
- Route protection is enforced at the **Edge** via `middleware.ts` — server-rendered pages never reach the browser without a valid session

---

## 🎨 Design System

The app uses a custom dark design system defined as CSS variables in `globals.css`:

```css
--bg:           #0d0f14   /* Page background        */
--surface:      #161820   /* Card background         */
--surface-2:    #1e2029   /* Input background        */
--border:       #2a2d3a   /* Border colour           */
--accent:       #6366f1   /* Indigo primary colour   */
--priority-low:    #22c55e
--priority-medium: #f59e0b
--priority-high:   #ef4444
```

---

## 📄 License

MIT — feel free to use, modify, and distribute.
