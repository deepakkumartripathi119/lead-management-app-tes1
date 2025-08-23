const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const authRoutes = require('./api/routes/auth.routes.js');
const leadRoutes = require('./api/routes/leads.routes.js');

const app = express();

// Middleware

app.use(cors({
  origin: ['http://localhost:3000','http://192.168.0.107:3000'], // or use process.env.FRONTEND_URL
  credentials: true, // allow cookies to be sent
}));

app.use(cookieParser());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Simple root endpoint
app.get('/', (req, res) => {
    res.send('Lead Management API is active.');
});

module.exports = app;