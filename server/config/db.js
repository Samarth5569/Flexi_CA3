const mongoose = require('mongoose');

// Disable command buffering so Mongoose queries fail immediately when disconnected
// instead of hanging for 10,000ms
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mealmate';

  // Sanitize URI for safe logging without exposing credentials
  const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@');

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5-second initial selection timeout
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB] Connection Failed (${sanitizedURI}): ${error.message}`);
    console.warn(`[MongoDB Troubleshooting Guide]:
1. Ensure MongoDB Community Server is installed (or use MongoDB Atlas in server/.env).
2. If installed locally, verify the MongoDB service is running:
   - Run 'net start MongoDB' in an Administrator Command Prompt.
   - Or open 'services.msc' and start 'MongoDB Server'.
3. If using MongoDB Atlas, verify your connection string in server/.env and check Network Access (IP whitelist).
4. Verify port 27017 is open and accessible at mongodb://127.0.0.1:27017/mealmate.`);
    return null;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection established.');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection lost. Database is currently disconnected.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };
