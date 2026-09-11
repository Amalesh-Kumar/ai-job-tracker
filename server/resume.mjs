import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import prisma from "./db.mjs";
import { authenticateToken } from "./middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});


// UPLOAD RESUME
router.post(
  "/upload",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a PDF resume.",
        });
      }

      const parser = new PDFParse({
        data: req.file.buffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      const resumeText = result.text.trim();

      if (!resumeText) {
        return res.status(400).json({
          message:
            "Could not extract text from this PDF. Please upload a text-based PDF.",
        });
      }

      const resume = await prisma.resume.upsert({
        where: {
          userId: req.user.userId,
        },

        update: {
          fileName: req.file.originalname,
          text: resumeText,
        },

        create: {
          fileName: req.file.originalname,
          text: resumeText,
          userId: req.user.userId,
        },
      });

      res.json({
        message: "Resume uploaded successfully.",
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          textLength: resume.text.length,
        },
      });

    } catch (error) {
      console.error("RESUME ERROR:", error);

      res.status(500).json({
        message: "Failed to process resume.",
      });
    }
  }
);


// GET CURRENT USER'S RESUME
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const resume = await prisma.resume.findUnique({
        where: {
          userId: req.user.userId,
        },
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!resume) {
        return res.json(null);
      }

      res.json(resume);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch resume.",
      });
    }
  }
);

export default router;