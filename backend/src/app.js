const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const farmersRoutes = require('./routes/farmers.routes');
const cropsRoutes = require('./routes/crops.routes');
const profitRoutes = require('./routes/profit.routes');
const productsRoutes = require('./routes/products.routes');
const marketPricesRoutes = require('./routes/marketPrices.routes');
const labourersRoutes = require('./routes/labourers.routes');
const hiringRoutes = require('./routes/hiring.routes');
const weatherRoutes = require('./routes/weather.routes');
const tasksRoutes = require('./routes/tasks.routes');
const aiRoutes = require('./routes/ai.routes');
const learningRoutes = require('./routes/learning.routes');
const schemesRoutes = require('./routes/schemes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Strips any key starting with '$' or containing '.' from req.body/query/params -
// prevents NoSQL operator injection (e.g. ?role[$ne]=admin) from reaching Mongoose.
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Basic rate limiting on the whole API - tuned tighter per-route (e.g. auth) in later phases.
// Skipped under the automated test suite (Jest sets NODE_ENV=test) - a real
// client is still rate-limited normally in dev/production.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
app.use('/api', apiLimiter);

// --- Routes ---
// Crops/labour/AI/etc. are added route-by-route in their own phases
// (see routes/*.routes.js).
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/market-prices', marketPricesRoutes);
app.use('/api/labourers', labourersRoutes);
app.use('/api/hiring', hiringRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'UZHIRO API is running.' } });
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
