import express from "express";
import prisma from "./db.mjs";
import { authenticateToken } from "./middleware.js";

const router = express.Router();


// CREATE JOB
router.post("/", authenticateToken, async (req, res) => {
    try {
        const {
            company,
            position,
            jobUrl,
            status,
            appliedDate,
            salary,
            notes
        } = req.body;

        if (!company || !position) {
            return res.status(400).json({
                message: "Company and position are required"
            });
        }

        const job = await prisma.job.create({
            data: {
                company,
                position,
                jobUrl,
                status: status || "Applied",
                appliedDate: appliedDate
                    ? new Date(appliedDate)
                    : new Date(),
                salary,
                notes,
                userId: req.user.userId
            }
        });

        res.status(201).json(job);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create job"
        });
    }
});


// GET MY JOBS
router.get("/", authenticateToken, async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                userId: req.user.userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(jobs);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch jobs"
        });
    }
});


// UPDATE JOB
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        const existingJob = await prisma.job.findFirst({
            where: {
                id: jobId,
                userId: req.user.userId
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const {
            company,
            position,
            jobUrl,
            status,
            appliedDate,
            salary,
            notes
        } = req.body;

        const job = await prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                company,
                position,
                jobUrl,
                status,
                appliedDate: appliedDate
                    ? new Date(appliedDate)
                    : existingJob.appliedDate,
                salary,
                notes
            }
        });

        res.json(job);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update job"
        });
    }
});


// DELETE JOB
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        const existingJob = await prisma.job.findFirst({
            where: {
                id: jobId,
                userId: req.user.userId
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        await prisma.job.delete({
            where: {
                id: jobId
            }
        });

        res.json({
            message: "Job deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete job"
        });
    }
});


export default router;