# ActiveVista Server Configuration & Architecture

## Environment Configuration

Create a `.env` file in the root of the `server/` directory containing the following environment keys:

```env
# Database Configuration
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/activevista?retryWrites=true&w=majority

# Cryptographic Keys (JWT)
JWT=your_secure_primary_jwt_secret_key
JWT_REFRESH=your_secure_refresh_jwt_secret_key

# Network & Server Settings
PORT=8080
NODE_ENV=development

# Client Origin (CORS Whitelist)
CLIENT_URL=http://localhost:5173
```

---

## Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Startup Modes

#### Development Mode (with Hot Reloading via Nodemon)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

---

## Directory Architecture

```tree
server/
├── config/
│   └── db.js              # MongoDB Atlas connection manager and disconnect handlers
├── controllers/
│   └── userController.js  # Business logic for auth, profiles, and workout operations
├── middleware/
│   ├── auth.js            # JWT verification and bearer token parser
│   └── errorMiddleware.js # Centralized HTTP exception and error handlers
├── models/
│   ├── userModel.js       # User account schema with password hashing hooks
│   └── Workout.js         # Workout logging schema and metric calculations
├── routes/
│   └── userRoute.js       # REST route mappings for /api/user endpoints
├── utils/
│   └── generateToken.js   # JWT token generation utilities
├── server.js              # Express 5 application bootstrap and security middleware
└── package.json           # Service dependencies and operational scripts
```

---

## REST API Surface

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Service health verification and API information |
| `GET` | `/health` | Public | System uptime and database connectivity probe |
| `POST` | `/api/user/signup` | Public | Athlete registration with credential encryption |
| `POST` | `/api/user/signin` | Public | User authentication and JWT issuance |
| `GET` | `/api/user/profile` | Protected | Retrieves authenticated user profile data |
| `GET` | `/api/user/dashboard` | Protected | Aggregates workout counts and caloric expenditure metrics |
| `GET` | `/api/user/workout` | Protected | Queries workout logs filtered by target date |
| `POST` | `/api/user/workout` | Protected | Records new completed workout entry |

---

## Architectural Guarantees

* **Graceful Lifecycle Management**: Handles SIGINT/SIGTERM signals to safely terminate database sockets.
* **Stateless Authorization**: JWT authentication with standardized bearer token validation.
* **Defensive Middleware Pipeline**: Express Rate Limiting, Mongo Sanitize for NoSQL injection prevention, HPP, and Helmet security headers.
* **Centralized Error Handling**: Standardized JSON error response format across all endpoints.
