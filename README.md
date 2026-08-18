<div align="center">

# ActiveVista
### Next-Generation Fitness Intelligence Command Center
**An Enterprise Product Engineered under the UniCord Digital Ecosystem**

<br/>

[![UniCord Product](https://img.shields.io/badge/Organization-UniCord-0052FF?style=flat-square&logo=shield&logoColor=white)](https://github.com/prasadaniket)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

<br/>

`Deep Void Architecture` | `Glassmorphism Design System` | `Telemetry & Metric Analytics`

</div>

---

## Executive Summary

**ActiveVista** is a full-stack, enterprise-grade Fitness Intelligence Platform engineered by **UniCord**. Designed for athletes, health enthusiasts, and high-performance training regimens, ActiveVista bridges raw physical telemetry with actionable digital analytics through a centralized, high-contrast dashboard.

The application delivers real-time physiological metric tracking, interactive WebGL and dynamic vector canvas motion fields, end-to-end JWT session security, and resilient NoSQL database persistence.

---

## System Architecture

<div align="center">
  <img src="client/public/architect/tech_stack.png" width="85%" alt="ActiveVista System Architecture Blueprint" />
</div>

ActiveVista operates on a decoupled client-server model engineered for low latency, modular maintainability, and horizontal scalability:

### 1. Athlete Interface Service (`client/`)
* **Core Framework**: React 19 and Vite 7 bundle pipeline for near-instant hot module replacement (HMR) and optimized modern JavaScript delivery.
* **Design System**: Tailwind CSS v4 featuring a customized glassmorphic token architecture with backdrop blur filters, dark-mode void contrast layers, and dynamic blue accents.
* **Kinetic & Canvas Motion**: Multi-layered Perlin/Simplex noise particle wave simulation via HTML5 Canvas and Three.js modules, coupled with Framer Motion physics-based micro-interactions.
* **Component Primitives**: Radix UI primitive layer providing WCAG-compliant accessibility across dialogs, tooltips, navigation menus, and form elements.
* **Routing & Network State**: React Router 7 paired with configured Axios interceptors for automated authentication header injection and global error handling.

### 2. Core API & Intelligence Service (`server/`)
* **Runtime**: Node.js (>=18.0.0 LTS) running on the Express 5 framework.
* **Security Layer**: Stateless JSON Web Token (JWT) authorization, Bcrypt cryptographic password hashing, Helmet HTTP protection headers, HTTP Parameter Pollution (HPP) shielding, automated rate limiting, and NoSQL injection query sanitization.
* **Data Vault**: MongoDB Atlas cloud cluster with Mongoose 8 object document modeling, schema validation, and pre-save lifecycle hooks.

<br/>

<div align="center">
  <img src="client/public/architect/dashboard_flow.png" width="85%" alt="ActiveVista Dashboard Execution Flow" />
</div>

---

## Core Capabilities

| Module | Architectural Implementation | Business & User Impact |
| :--- | :--- | :--- |
| **Tactical Dashboard** | Aggregated MongoDB analytics and interactive data visualizations | Delivers instant operational oversight on total workouts, cumulative caloric burn, and goal progression. |
| **Workout Logging Engine** | Granular multi-category entry with date tagging | Enables athletes to record sessions with precise sets, reps, weight loads, duration, and energy expenditure metrics. |
| **Dynamic Vector Waves** | Math-driven Simplex noise vector field rendered on Canvas | Immersive cursor-reactive backdrop creating an elevated, modern user experience. |
| **Authenticated User Vault** | Cryptographic session handshakes via secure HTTP authorization | Guarantees data privacy, athlete profile management, and historical session integrity. |
| **Media Repository** | High-performance responsive media grid | Showcases athletic progression, transformation logs, and brand aesthetics. |

---

## Navigation Topology

<div align="center">
  <img src="client/public/architect/sitemap.png" width="85%" alt="ActiveVista Navigation Topology" />
</div>

---

## Directory Structure

```tree
ActiveVista/
├── client/                      # Frontend Single Page Application
│   ├── public/                  # Static assets and architectural schematics
│   │   ├── architect/           # Architecture diagrams
│   │   └── ...
│   ├── src/
│   │   ├── api/                 # Axios interceptors and API endpoints
│   │   ├── components/          # Reusable UI and layout components
│   │   │   ├── cards/           # Analytic metric cards and workout logs
│   │   │   ├── home_compo/      # Hero section, feature grids, and landing views
│   │   │   └── ui/              # Canvas waves, dialogs, buttons, and alerts
│   │   ├── pages/               # Dashboard, Workout, Profile, Gallery, AboutUs
│   │   ├── App.jsx              # Application router and session provider
│   │   ├── index.css            # Tailwind CSS design system tokens
│   │   └── main.jsx             # React 19 application entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend REST API Service
│   ├── config/                  # MongoDB Atlas connection manager
│   ├── controllers/             # Authentication and workout business controllers
│   ├── middleware/              # Authentication guards and centralized error handlers
│   ├── models/                  # Mongoose data schemas (User, Workout)
│   ├── routes/                  # RESTful API route definitions
│   ├── utils/                   # Token utilities and cryptographic helpers
│   ├── server.js                # Express 5 initialization and security middleware
│   └── package.json
│
├── LICENSE                      # MIT License (UniCord)
└── README.md                    # Project Documentation
```

---

## API Specification

All backend endpoints are scoped under the `/api` namespace.

### Authentication & Athlete Profile
* `POST /api/user/signup` — Create a new athlete account with encrypted credentials.
* `POST /api/user/signin` — Authenticate credentials and return a signed JWT token.
* `GET  /api/user/profile` — Retrieve authenticated user profile *(Requires Bearer Token)*.

### Metrics & Analytics
* `GET  /api/user/dashboard` — Fetch aggregated workout counts, calories burned, and categorical analytics *(Requires Bearer Token)*.

### Workout Operations
* `GET  /api/user/workout` — Query recorded workout sessions filtered by target date *(Requires Bearer Token)*.
* `POST /api/user/workout` — Register a completed workout session with category and performance metrics *(Requires Bearer Token)*.

---

## Setup & Deployment Guide

### Prerequisites
* **Node.js**: Version 18.0.0 or higher
* **npm**: Version 9.0.0 or higher
* **MongoDB**: Active MongoDB Atlas URI or local MongoDB instance

### 1. Clone Repository
```bash
git clone https://github.com/prasadaniket/ActiveVista.git
cd ActiveVista
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Network Configuration
PORT=8080
NODE_ENV=development

# Database Connection
MONGODB_URL=your_mongodb_connection_uri

# JSON Web Token Secret Keys
JWT=your_secure_jwt_secret_key
JWT_REFRESH=your_secure_refresh_jwt_key

# CORS Client Origin
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install --prefix server

# Install frontend dependencies
npm install --prefix client
```

### 4. Run Development Environment

**Start API Server:**
```bash
cd server
npm run dev
# Server listening on http://localhost:8080
```

**Start Frontend Application (in a separate terminal):**
```bash
cd client
npm run dev
# Application accessible on http://localhost:5173
```

---

## Security Compliance & Hardening

ActiveVista adheres to strict application security standards:
* **Stateless Token Management**: Short-lived JWTs validated on every protected API call.
* **NoSQL Injection Defense**: Automated parameter sanitization across query strings and request bodies.
* **Brute-Force Rate Limiting**: Request threshold policies applied to authentication endpoints.
* **Security Headers**: Standardized Helmet policy configurations preventing XSS, MIME-sniffing, and clickjacking.
* **CORS Whitelisting**: Strict origin restrictions preventing unauthorized cross-origin data access.

---

## License

This software is released under the **MIT License** by **UniCord**.  
Please refer to the [LICENSE](LICENSE) file for the complete terms and conditions.

<div align="center">
<br/>

**Copyright (c) 2026 UniCord. All rights reserved.**  
*Enterprise Health & Performance Technologies.*

</div>
