import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

//Connect to MongoDB
connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "https://idea-drop-ui-mocha.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/ideas", ideaRouter);
app.use("/api/auth", authRouter);
//404 fallback
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});
//error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
