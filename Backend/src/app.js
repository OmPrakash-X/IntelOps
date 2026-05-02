import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import incidentRoutes from "./routes/incident.routes.js";
import timelineRoutes from "./routes/timeline.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

//Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use("/api/incidents", timelineRoutes);
app.use("/api/notifications", notificationRoutes);
export default app;