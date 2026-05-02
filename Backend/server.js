import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initSocket } from "./src//socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();