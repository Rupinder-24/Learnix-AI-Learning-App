import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


// import userRoutes from './routes/userRoutes.js';
// import taskRoutes from './routes/taskRoutes.js';
// import reportRoutes from './routes/reportRoutes.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const _dirname=path.resolve();

const app = express();

// Middleware to handle cors
app.use(
    cors({
        origin:process.env.CORS_ORIGIN, // Allow requests from this origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    })
)

// connect to database

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// Routes
app.use("/api/auth",authRoutes);
app.use("/api/documents",documentRoutes);
app.use("/api/flashcards",flashcardRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/quizzes",quizRoutes);
app.use("/api/progress",progressRoutes);
// app.use("/api/tasks",taskRoutes);
// app.use("/api/reports",reportRoutes);

// server uploads folder 
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

// app.use(express.static(path.join(_dirname,"/frontend/dist")));



app.get("/", (req, res) => {
  res.json({success: true});
  
});
app.use(errorHandler);

const PORT = process.env.PORT || 8000;






app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));