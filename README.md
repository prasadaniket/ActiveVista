<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# 🏃‍♂️ ActiveVista — Fitness Tracker

> A modern full-stack fitness tracker to log workouts, track daily steps, follow 30-day workout plans, and view rich analytics — all through a responsive, premium UI.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [API Reference](#-api-reference)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Database Models](#-database-models)
- [Client Pages](#-client-pages)
- [Responsive Design](#-responsive-design)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

ActiveVista is a **React + Express + MongoDB** application designed for fitness enthusiasts who want to take control of their workout routines. Whether you're a beginner or an advanced athlete, ActiveVista provides the tools to:

- **Log free-form workouts** with full details (sets, reps, weight, duration, calories)
- **Track daily steps** with auto-calculated distance and calories burned
- **Follow structured 30-day plans** — activate, switch, or terminate plans seamlessly
- **Analyze your progress** through a rich dashboard with charts, streaks, and category breakdowns
- **Manage your profile** with body metrics, fitness goals, and equipment preferences

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure sign-up/sign-in with automatic token management |
| 🏋️ **Workout Logging** | Log custom workouts with category, sets, reps, weight, duration & calories |
| 👣 **Steps Tracking** | Daily step counter with auto-derived distance (km) and calories burned |
| 📅 **30-Day Plans** | Activate recommended or custom plans; track per-day completion and streaks |
| 📊 **Analytics Dashboard** | Weekly activity charts, category pie chart, plan progress, and totals |
| 🔄 **Real-Time Refresh** | Custom browser events (`plan:activated`, `workout:completed`, `steps:saved`) keep all pages in sync |
| 📱 **Fully Responsive** | Mobile-first design with Tailwind breakpoints; desktop layout preserved |
| 👤 **Rich Profile** | Body type, fitness level, goals, equipment preferences, and password management |
| 📜 **Workout History** | Browse and manage all past workouts with ratings and notes |
| 💡 **Smart Recommendations** | Auto-seeded recommended plans based on difficulty level |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Radix UI** | Accessible component primitives (Dialog, Calendar, Tooltip, etc.) |
| **Lucide React** | Icon library |
| **Axios** | HTTP client with interceptors |
| **dayjs / date-fns** | Date manipulation |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | Runtime |
| **Express 5** | Web framework |
| **Mongoose 8** | MongoDB ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **dotenv** | Environment variable management |
| **nodemon** | Development auto-restart |

### Database
| Technology | Purpose |
|-----------|---------|
| **MongoDB** | NoSQL database (local or Atlas) |

---

## 📁 Project Structure

```
ActiveVista/
│
├── client/                           # React SPA (Vite)
│   ├── pages/
│   │   ├── Authentication.jsx        # Sign In / Sign Up gate
│   │   ├── Dashboard.jsx             # Analytics, charts, plan progress
│   │   ├── Profile.jsx               # User profile, settings, steps snapshot
│   │   └── Workout.jsx               # Steps, active plan, calendar, history
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js       # Centralized axios with JWT interceptor
│   │   │   └── index.js              # API helper functions
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── SignIn.jsx            # Sign in form
│   │   │   ├── SignUp.jsx            # Sign up form
│   │   │   ├── AddWorkout.jsx        # Add workout modal
│   │   │   ├── cards/                # Dashboard widgets
│   │   │   │   ├── CategoryChart.jsx # Pie chart by workout category
│   │   │   │   ├── CountsCard.jsx    # Summary stat cards
│   │   │   │   ├── Recom.jsx         # Recommended plans
│   │   │   │   ├── WeeklyStatCard.jsx# Weekly activity bar chart
│   │   │   │   └── WorkoutCard.jsx   # Individual workout display
│   │   │   └── ui/                   # 16 Radix-based primitive components
│   │   ├── App.jsx                   # Auth gate + React Router
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Tailwind + global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Express API
│   ├── config/
│   │   └── db.js                     # MongoDB connection (Atlas fallback)
│   ├── controllers/
│   │   ├── userController.js         # Auth, profile, dashboard, steps, plans (~1760 LOC)
│   │   └── workoutController.js      # Workout CRUD operations
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification middleware
│   │   └── errorMiddleware.js        # Error handler & 404
│   ├── models/
│   │   ├── userModel.js              # User schema (profile, goals, preferences)
│   │   ├── Workout.js                # Free-form workout log
│   │   ├── UserPlan.js               # User's 30-day plan instance
│   │   ├── WorkoutPlan.js            # Plan template (weeks/days/exercises)
│   │   ├── WorkoutHistory.js         # Completed workout records
│   │   └── StepsModel.js             # Daily steps with derived metrics
│   ├── routes/
│   │   ├── userRoute.js              # 25+ user endpoints
│   │   └── workoutRoute.js           # Workout CRUD routes
│   ├── utils/
│   │   └── generateToken.js          # JWT generation & verification
│   ├── server.js                     # Main entry point
│   ├── app.js                        # Legacy bootstrap
│   ├── .env                          # Environment config
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or later
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ActiveVista

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Environment Variables

Create a `server/.env` file:

```env
MONGODB_URL=mongodb://localhost:27017/activevista
JWT=your_jwt_secret_key
PORT=4000
```

Optionally create `client/.env`:

```env
VITE_API_BASE=http://localhost:4000/api
```

### Running the App

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev          # Express on http://localhost:4000

# Terminal 2 — Frontend
cd client
npm run dev          # Vite on http://localhost:5173
```

Open your browser at **http://localhost:5173** to start using ActiveVista.

### Production Build

```bash
cd client
npm run build        # Build for production
npm run preview      # Preview the production build
```

---

## 📜 Scripts

### Client (`client/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint |

### Server (`server/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start with nodemon (auto-restart) |
| Start | `npm start` | Start in production mode |
| Legacy | `npm run legacy` | Start legacy `app.js` entry |

---

## 📡 API Reference

**Base URL:** `http://localhost:4000/api`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/user/signup` | ✗ | Register a new user |
| `POST` | `/user/signin` | ✗ | Login and receive JWT |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/user/profile` | ✓ | Get user profile |
| `PUT` | `/user/profile` | ✓ | Update user profile |
| `PUT` | `/user/change-password` | ✓ | Change password |
| `POST` | `/user/migrate-fields` | ✓ | Migrate missing profile fields |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/user/dashboard` | ✓ | Dashboard aggregates (totals, charts, plan progress) |

### Workouts

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/user/workout` | ✓ | List workouts (filter by date) |
| `POST` | `/user/workout` | ✓ | Create a workout |
| `DELETE` | `/user/workout/:id` | ✓ | Delete a workout |
| `POST` | `/user/workout/:id/complete` | ✓ | Mark workout as complete |
| `POST` | `/user/workout/complete` | ✓ | Complete workout (body-based lookup) |

### Steps Tracking

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/user/steps` | ✓ | Get daily steps for a date |
| `POST` | `/user/steps` | ✓ | Save/update daily steps |
| `GET` | `/user/steps/weekly` | ✓ | Weekly steps summary |

### 30-Day Workout Plans

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/user/use-plan` | ✓ | Activate or switch plan (auto-terminates old) |
| `GET` | `/user/active-plan` | ✓ | Get current active plan |
| `GET` | `/user/past-plans` | ✓ | List all past/terminated plans |
| `POST` | `/user/terminate-plan` | ✓ | Terminate current plan |
| `POST` | `/user/complete-plan-workout` | ✓ | Mark full plan day as complete |
| `POST` | `/user/complete-individual-workout` | ✓ | Mark single workout in a plan day |
| `GET` | `/user/recommended-plans` | ✓ | Get recommended plans |
| `GET` | `/user/workout-plans` | ✓ | Get user's custom plans |
| `POST` | `/user/workout-plans` | ✓ | Create custom workout plan |

### Workout History

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/user/workout-history` | ✓ | Get workout history |
| `GET` | `/user/all-workouts` | ✓ | All historical workouts |
| `DELETE` | `/user/workout-history/:id` | ✓ | Delete history entry |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/health` | ✗ | Server health check (uptime, memory) |

---

## 🏗 Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│                                                          │
│   Authentication ──→ Dashboard ──→ Workouts ──→ Profile  │
│         │                │             │           │     │
│         └────────── axiosInstance ──────┘           │     │
│                     (JWT interceptor)               │     │
│                          │                          │     │
│         Custom Events: plan:activated,              │     │
│                workout:completed, steps:saved        │     │
└──────────────────────────┬──────────────────────────┘
                           │ HTTP + Bearer Token
┌──────────────────────────▼──────────────────────────┐
│                   EXPRESS SERVER                     │
│                                                      │
│   verifyToken ──→ userController / workoutController │
│                          │                           │
└──────────────────────────┬──────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────┐
│                      MONGODB                         │
│                                                      │
│   Users │ Workouts │ Steps │ UserPlans │ Plans │ Hist │
└─────────────────────────────────────────────────────┘
```

**Key data flow points:**
- **Token Management**: JWT is stored in `localStorage` under `fittrack-app-token` and auto-injected by axios interceptors
- **Protected Routes**: All endpoints (except `/signup`, `/signin`, `/health`) require a Bearer token validated by `verifyToken` middleware
- **Real-Time Sync**: UI components emit custom browser events to trigger refresh across Dashboard, Workout, and Profile pages without full reload
- **Dashboard Aggregation**: The dashboard endpoint aggregates data from **three** collections — `Workout`, `WorkoutHistory`, and `UserPlan` — for comprehensive stats

---

## 💾 Database Models

| Model | Collection | Purpose |
|-------|-----------|---------|
| **User** | `users` | User accounts with profile (name, email, gender, age, weight, height, body type, fitness level, goals, preferences) |
| **Workout** | `workouts` | Free-form workout entries (category, name, sets, reps, weight, duration, calories, date) |
| **Steps** | `steps` | Per-user, per-day step counts with auto-derived distance and calories via pre-save middleware |
| **WorkoutPlan** | `workoutplans` | Plan templates organized as weeks → days → workouts → exercises |
| **UserPlan** | `userplans` | User-specific plan instances with 30-day mapping, per-workout completion, streaks |
| **WorkoutHistory** | `workouthistories` | Historical completed workouts with exercises, duration, calories, ratings |

### Steps Auto-Calculation

The `Steps` model automatically calculates derived fields on save:
- **Distance**: `steps × 0.0005 km`
- **Calories**: `steps × 0.04 kcal`
- **Default Goal**: 10,000 steps/day

---

## 🖥 Client Pages

### Authentication
Split-screen layout with a hero background on the left and sign-in/sign-up forms on the right. Successful auth stores the JWT and renders the authenticated app shell.

### Dashboard
- **Summary Cards** — Total workouts, calories burned, and averages
- **Weekly Activity** — 7-day bar chart (includes plan workout data)
- **Category Breakdown** — Pie chart (Cardio / Strength / Flexibility / Other)
- **Plan Progress** — Completion %, streak, days remaining
- **Recommendations** — Suggested 30-day workout plans

### Workouts
- **Steps Tracker** — Input and save daily step count
- **Active Plan View** — 30-day calendar with per-day workouts and completion toggles
- **Add Workout** — Modal form for free-form workout entry
- **History** — Scrollable list with complete/delete actions

### Profile
- **Personal Info** — Name, email, gender, pronouns, age
- **Body Metrics** — Weight, height, body type
- **Fitness Settings** — Level, experience, goals, equipment preferences
- **Security** — Password change
- **Steps Snapshot** — Today's step count at a glance

---

## 📱 Responsive Design

- Built with **Tailwind CSS v4** using mobile-first utilities
- Breakpoints: `sm` / `md` / `lg` / `xl`
- Desktop layouts are fully preserved; mobile views stack grids and cards with condensed spacing
- Uses `bg-gradient-to-br from-slate-50 to-blue-50` for the app shell background

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CSS import error** | Ensure Google Fonts `@import` is the **first line** in `src/index.css` |
| **No active plan shown** | `/active-plan` returns `null` when no plan is active — handled gracefully in UI |
| **401 Unauthorized** | Check that the JWT is present in `localStorage` and the server's `JWT` env var matches |
| **MongoDB connection fails** | Verify `MONGODB_URL` in `.env` and ensure MongoDB is running |
| **Network errors on client** | Confirm the server is running on `http://localhost:4000` |
| **Stale data after actions** | Verify custom browser events are being dispatched and listened to |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) — Accessible component primitives
- [Lucide Icons](https://lucide.dev/) — Beautiful icon set
- [Day.js](https://day.js.org/) / [date-fns](https://date-fns.org/) — Date utilities
- [Express](https://expressjs.com/) — Web framework
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
