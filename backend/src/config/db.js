const mongoose = require('mongoose');

async function connectDB() {
    try {
        const MONG_URL = (process.env.PORT===5000)?process.env.MONGO_URI_PRODUCTION:process.env.MONGO_URI_LOCAL;
        const conn = await mongoose.connect(MONG_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected:', conn.connection.host);
    } catch (err) {
        console.error('Database Connection Error:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;