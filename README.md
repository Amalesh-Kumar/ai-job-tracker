# 🤖 AI Job Tracker

A full-stack AI-powered job tracking application that helps users manage job applications and analyze their resume against real-world job descriptions.

## 🚀 Features

### 🔐 Authentication

* User registration and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected API routes

### 📋 Job Tracking

* Add job applications
* Edit applications
* Delete applications
* Track application status
* Search applications
* Filter by status
* Track application statistics

### 📄 Resume Management

* Upload PDF resume
* Extract resume text automatically
* Store resume securely for the authenticated user
* Replace existing resume

### 🧠 AI Resume Analyzer

* Compare resume against a job description
* Generate personalized match score
* Identify matching skills
* Identify missing skills
* Identify experience gaps
* Provide personalized recommendations
* Powered by Google Gemini

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* JWT
* bcryptjs
* Multer
* pdf-parse

### Database

* PostgreSQL
* Supabase
* Prisma ORM

### AI

* Google Gemini API

### Deployment

* Vercel
* Render
* Supabase

## 🏗️ Architecture

```text
React + Vite
     │
     │ REST API + JWT
     ▼
Node.js + Express
     │
     ├──────────────► Supabase PostgreSQL
     │
     ├──────────────► Prisma ORM
     │
     ├──────────────► PDF Resume Parser
     │
     └──────────────► Google Gemini
```

## 📂 Project Structure

```text
ai-job-tracker/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── ai.mjs
│   ├── auth.mjs
│   ├── db.mjs
│   ├── jobs.mjs
│   ├── middleware.js
│   ├── resume.mjs
│   ├── server.mjs
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ai-job-tracker
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create:

```text
server/.env
```

Add:

```env
DATABASE_URL="your-supabase-database-url"
JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
```

Never commit `.env` files to GitHub.

### 5. Run the backend

From the `server` directory:

```bash
node server.mjs
```

The backend runs locally on:

```text
http://localhost:5000
```

### 6. Run the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

## 🔑 Environment Variables

| Variable         | Purpose                        |
| ---------------- | ------------------------------ |
| `DATABASE_URL`   | Supabase PostgreSQL connection |
| `JWT_SECRET`     | JWT authentication secret      |
| `GEMINI_API_KEY` | Google Gemini API key          |

## 🤖 How the AI Analyzer Works

The AI analyzer does not analyze the job description alone.

The authenticated user is identified using the JWT token.

The backend then retrieves that user's stored resume from PostgreSQL and sends:

```text
User's Resume
      +
Job Description
      ↓
Google Gemini
      ↓
Personalized Analysis
```

The result includes:

* Match score
* Matching skills
* Missing skills
* Experience gaps
* Recommendation

## 🔒 Security

* Passwords are hashed using bcrypt.
* Protected endpoints require JWT authentication.
* Users can only access their own jobs and resume.
* Gemini API credentials remain on the backend.
* Database credentials are stored in environment variables.
* `.env` files are excluded from Git.

## 🌐 Deployment

The frontend can be deployed using Vercel and the backend using Render.

The production frontend must use the deployed backend URL instead of:

```text
http://localhost:5000
```

## 📌 Future Improvements

Potential future improvements include:

* Saved AI analyses
* Job application reminders
* Email notifications
* Resume version management
* Job board integrations
* Advanced analytics
* Interview preparation
* Resume improvement suggestions

## 👨‍💻 Author

Built as a full-stack AI project using React, Node.js, PostgreSQL, Prisma and Google Gemini.
