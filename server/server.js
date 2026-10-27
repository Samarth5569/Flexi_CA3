const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, isDbConnected } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 1. Load environment variables before accessing configuration
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Diagnostics - always available)
app.get('/api/health', (req, res) => {
  const connected = isDbConnected();
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      connected,
      status: dbStateMap[dbState] || 'unknown',
      name: mongoose.connection.name || 'mealmate',
      host: mongoose.connection.host || 'unknown'
    }
  });
});

// Mount application API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/meal-plans', require('./routes/mealPlanRoutes'));
app.use('/api/grocery', require('./routes/groceryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 Fallback
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

let server;

// Start server after awaiting database connection
const startServer = async () => {
  console.log('[MealMate Server] Initializing MongoDB connection...');
  const conn = await connectDB();

  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`[MealMate Server] Running on http://localhost:${PORT}`);
    console.log(`[MealMate Server] Health check available at http://localhost:${PORT}/api/health`);
    if (conn) {
      console.log(`[MealMate Server] MongoDB connected successfully. Ready to process application requests.`);
    } else {
      console.warn(`[MealMate Server] WARNING: MongoDB is not connected. Application endpoints will respond with 503 until MongoDB is available.`);
    }
  });
};

if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections safely
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

module.exports = { app, server, startServer };
