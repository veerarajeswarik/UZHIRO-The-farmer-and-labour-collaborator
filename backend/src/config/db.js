const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * The server is allowed to start without a working DB connection in development
 * so the API skeleton (e.g. /api/health) can still be exercised, but every
 * route that needs the database will fail until a real connection succeeds.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[db] MONGODB_URI is required in production. Set it in your hosting environment settings.');
      process.exit(1);
    }
    console.warn(
      '[db] MONGODB_URI is not set. Skipping database connection - set it in backend/.env to enable data features.'
    );
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    if (process.env.NODE_ENV === 'production') {
      // In production a missing DB is fatal - fail fast instead of serving a broken API.
      process.exit(1);
    }
    return null;
  }
}

module.exports = connectDB;
