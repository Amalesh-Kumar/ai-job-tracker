import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./auth.mjs";
import jobRoutes from "./jobs.mjs";
import aiRoutes from "./ai.mjs";
import resumeRoutes from "./resume.mjs";

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AI Job Tracker API is running!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});