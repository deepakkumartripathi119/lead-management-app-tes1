const app = require("./src/app");
const connectDB = require("./src/config/db");
require("dotenv").config();

connectDB();

const PORT = (process.env.NODE_ENV === "production") ? 5000 : process.env.PORT;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
