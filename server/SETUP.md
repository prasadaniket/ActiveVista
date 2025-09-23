# ActiveVista Server Setup

## Environment Variables Required

Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
MONGODB_URL=mongodb+srv://activeUser0:userAV@clusterav.ddlacen.mongodb.net/

# JWT Configuration
JWT=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_REFRESH=your_super_secret_refresh_jwt_key_here_make_it_long_and_secure

# Server Configuration
PORT=8080
NODE_ENV=development

# Client Configuration (for CORS)
CLIENT_URL=http://localhost:3000
```

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the variables above

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start

# Legacy app.js (if needed)
npm run legacy
```

## Project Structure

```
server/
├── config/
│   └── db.js              # Database connection configuration
├── Controllers/
│   └── userController.js  # User and workout controllers
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── errorMiddleware.js # Error handling middleware
├── models/
│   ├── userModel.js       # User schema
│   └── Workout.js         # Workout schema
├── routes/
│   └── userRoute.js       # User routes
├── utils/
│   └── generateToken.js   # JWT token utilities
├── app.js                 # Legacy app file
├── server.js              # Main server file
└── package.json
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/user/signup` - User registration
- `POST /api/user/signin` - User login
- `GET /api/user/dashboard` - User dashboard data
- `GET /api/user/workout` - Get workouts by date
- `POST /api/user/workout` - Add new workout

## Features

- ✅ MongoDB database connection with graceful shutdown
- ✅ JWT authentication with proper token management
- ✅ Comprehensive error handling
- ✅ Request logging
- ✅ CORS configuration
- ✅ Environment-based configuration
- ✅ Health check endpoint
