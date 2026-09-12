require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const readingsRoutes = require('./routes/readings');
const medicationsRoutes = require('./routes/medications');

const app = express();
const PORT = process.env.PORT || 3001;

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
