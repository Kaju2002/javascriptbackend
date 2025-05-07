import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../config/mongodb.js"; // adjust path
import authRouter from "../Routes/authRoutes.js";
import userRouter from "../Routes/userRoutes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json());
app.use(cookieParser());
connectDB();

const allowedOrigins = [
    'http://localhost:5173',
    'https://globalize.vercel.app'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.get('/api/', (req, res) => {
    res.json({ message: "Serverless backend running on Vercel!" });
});

// ❗️Export as serverless function
export default serverless(app);
