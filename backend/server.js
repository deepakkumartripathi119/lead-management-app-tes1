const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
