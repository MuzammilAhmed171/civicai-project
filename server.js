const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());

// Support high-resolution image uploads (up to 50MB payload)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure Database Connection BEFORE Route Execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database Middleware Error:', err?.message);
    res.status(500).json({ error: 'Database connection failure. Please try again in a moment.' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'CivicAI Backend API Server is running smoothly!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'CivicAI Smart Platform API is active!' });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} is already in use. Please close previous process or restart terminal.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;
