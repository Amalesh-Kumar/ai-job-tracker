import express from "express";
import { GoogleGenAI } from "@google/genai";
import prisma from "./db.mjs";
import { authenticateToken } from "./middleware.js";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        message: "Please provide a valid job description.",
      });
    }

    // Get the logged-in user's resume
    const resume = await prisma.resume.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!resume) {
      return res.status(400).json({
        message: "Please upload your resume before using AI analysis.",
      });
    }

    const prompt = `
You are a professional job and resume analyzer.

Analyze the candidate's resume against the job description.

IMPORTANT:
The candidate's resume belongs to the currently logged-in user.
Use ONLY the information present in the resume.
Do not invent skills, experience, education, or qualifications.

Return ONLY valid JSON in exactly this structure:

{
  "matchScore": 0,
  "summary": "short explanation of the overall match",
  "matchingSkills": [],
  "missingSkills": [],
  "experienceGaps": [],
  "recommendation": "short recommendation"
}

Rules:
- matchScore must be an integer from 0 to 100.
- matchingSkills should contain skills present in the resume that are relevant to the job.
- missingSkills should contain important job requirements that are not clearly present in the resume.
- experienceGaps should mention important experience requirements the candidate may lack.
- Keep all arrays concise.
- Do not use markdown.
- Return JSON only.

CANDIDATE RESUME:
${resume.text}

JOB DESCRIPTION:
${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    res.json(result);

  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      message: "AI analysis failed.",
    });
  }
});

export default router;