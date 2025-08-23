const express = require('express');
const cors = require('cors');
const authRoutes = require('./api/routes/auth.routes');
const leadRoutes = require('./api/routes/leads.routes');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Simple root endpoint
app.get('/', (req, res) => {
    res.send('Lead Management API is active.');
});

module.exports = app;