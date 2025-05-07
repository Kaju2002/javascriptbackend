import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../config/mongodb.js";
import authRouter from "../Routes/authRoutes.js";
import userRouter from "../Routes/userRoutes.js";
import serverless from "serverless-http";

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Fixed CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://globalize.vercel.app'],
  credentials: true
}));


// API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/api', (req, res) => {
  res.json({ message: "✅ Express API is live on Vercel!" });
});

// Export serverless handler
export const handler = serverless(app);
