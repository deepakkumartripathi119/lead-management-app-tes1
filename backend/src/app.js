const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./api/routes/auth.routes.js');
const leadRoutes = require('./api/routes/leads.routes.js');

const app = express();

app.use(cors({
  origin: [
    'https://lead-management-app2.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => {
  res.send('Lead Management API is active.');
});

module.exports = app;