import express from "express"
import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./Routes/authRoutes.js";
import userRouter from "./Routes/userRoutes.js";


const app = express();
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');  // Allow the page to interact with cross-origin content
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none'); // Allow embedding cross-origin resources
    next();
  });
  
app.use(express.json());
app.use(cookieParser());
connectDB()
const allowedOrigins = ['http://localhost:5173']; // Add your frontend origin
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API endpoints
app.get("/", (req, res) => {
    res.send("Server is running properly");
});

app.use('/api/auth',authRouter);
app.use('/api/user', userRouter);
app.use(express.static('public'));

// Your static files or route handling go here
app.use(express.static('public'));


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});