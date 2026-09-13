require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const readingsRoutes = require('./routes/readings');
const medicationsRoutes = require('./routes/medications');

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const requestCounts = new Map();

app.use((req, res, next) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const clientRequests = requestCounts.get(req.ip) || [];
  const recent = clientRequests.filter(t => t > windowStart);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ success: false, error: 'Request limit exceeded' });
  }

  recent.push(now);
  requestCounts.set(req.ip, recent);
  next();
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/readings', readingsRoutes);
app.use('/api/medications', medicationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`BP API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
