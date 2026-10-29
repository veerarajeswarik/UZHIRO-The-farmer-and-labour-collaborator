require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const PLACEHOLDER_SECRETS = ['replace-with-a-long-random-secret', 'dev-only-secret-change-in-production'];

/**
 * Refuses to start in production with a missing/placeholder/too-short JWT
 * secret - a weak secret would let anyone forge auth tokens. In
 * development this only warns, so local setup with the example value
 * still works.
 */
function checkJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  const looksPlaceholder = PLACEHOLDER_SECRETS.some((p) => secret.includes(p));
  const tooShort = secret.length > 0 && secret.length < 32;

  if (!secret || looksPlaceholder || tooShort) {
    const message =
      '[server] JWT_SECRET is missing, using the example placeholder, or too short (<32 chars). ' +
      'Set a long, random value in backend/.env before running in production.';
    if (process.env.NODE_ENV === 'production') {
      console.error(message);
      process.exit(1);
    } else {
      console.warn(message);
    }
  }
}

/**
 * In production CLIENT_URL must name the deployed frontend (e.g. the Netlify
 * URL) - without it CORS would only allow localhost and every browser
 * request would fail with "Failed to fetch".
 */
function checkClientUrl() {
  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
    console.error('[server] CLIENT_URL is required in production (your frontend URL, e.g. https://your-site.netlify.app).');
    process.exit(1);
  }
}

async function start() {
  checkJwtSecret();
  checkClientUrl();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] UZHIRO API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start();
