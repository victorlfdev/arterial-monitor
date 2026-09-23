require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { DatabaseError, ValidationError, AppError } = require('./utils/errors');
const readingsRoutes = require('./routes/readings');
const medicationsRoutes = require('./routes/medications');

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const requestCounts = new Map();

// Binary search to find the first timestamp > threshold in a sorted array (O(log n))
function findFirstAfter(arr, threshold) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= threshold) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

// Unhandled rejection listener
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Periodic cleanup of expired rate limit entries
const rateLimitCleanupInterval = setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of requestCounts.entries()) {
    const start = findFirstAfter(timestamps, windowStart);
    if (start === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, timestamps.slice(start));
    }
  }
}, 300000);

app.use((req, res, next) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  let clientRequests = requestCounts.get(req.ip);

  if (clientRequests) {
    const start = findFirstAfter(clientRequests, windowStart);
    if (start === 0) {
      requestCounts.delete(req.ip);
    } else {
      clientRequests = clientRequests.slice(start);
      requestCounts.set(req.ip, clientRequests);
    }
  } else {
    clientRequests = [];
  }

  if (clientRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    clientRequests.push(now);
    requestCounts.set(req.ip, clientRequests);
    return res.status(429).json({ success: false, error: 'Request limit exceeded' });
  }

  clientRequests.push(now);
  requestCounts.set(req.ip, clientRequests);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// Handle malformed JSON from express.json() parser
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Request correlation ID - adds a unique ID to each request for log tracing
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use('/api/readings', readingsRoutes);
app.use('/api/medications', medicationsRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'BP API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      readings: 'GET/POST /api/readings',
      medications: 'GET/POST /api/medications',
    },
  });
});

app.get('/docs', (req, res) => {
  res.json({
    name: 'BP API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/', description: 'API info' },
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/readings', description: 'List all readings' },
      { method: 'POST', path: '/api/readings', description: 'Create a reading' },
      { method: 'GET', path: '/api/medications', description: 'List all medications' },
      { method: 'POST', path: '/api/medications', description: 'Create a medication' },
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Structured error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      error: 'An internal database error occurred',
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
  });
});

const server = app.listen(PORT, () => {
  console.log(`BP API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handler for SIGINT/SIGTERM
function shutdown(exitCode) {
  console.log('Shutting down...');
  clearInterval(rateLimitCleanupInterval);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(exitCode);
  });
  server.setTimeout(5000);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown(1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
