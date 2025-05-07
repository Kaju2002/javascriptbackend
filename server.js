import express from "express";
import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./Routes/authRoutes.js";
import userRouter from "./Routes/userRoutes.js";

const app = express();

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDB();

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',        // Your local frontend dev URL
    'https://globalize.vercel.app'  // Your DEPLOYED Vercel frontend URL
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

// Optional: Cross-Origin Policies (only if you specifically need them)
// Consider if these are truly necessary for your use case.
// app.use((req, res, next) => {
//     res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
//     res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
//     next();
// });

// API Routes
app.get("/", (req, res) => {
    res.json({ message: "Server is running properly" }); // Good to send JSON for API root
});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Static files (if your backend needs to serve any)
// If not, you can remove this.
// app.use(express.static('public'));

// Centralized Error Handler (Recommended)
app.use((err, req, res, next) => {
  console.error("ERROR STACK:", err.stack);
  console.error("ERROR MESSAGE:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    // Optionally, for development: error: err.toString()
  });
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});