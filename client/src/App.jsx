import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleAuth(e) {
    e.preventDefault();

    const endpoint = isRegister
      ? "/api/auth/register"
      : "/api/auth/login";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      if (isRegister) {
        setMessage("Registration successful! Please login.");

        setIsRegister(false);

        setForm({
          name: "",
          email: form.email,
          password: "",
        });
      } else {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  if (!token) {
    return (
      <div className="auth-container">

        <div className="auth-card">

          <h1>AI Job Tracker</h1>

          <p>
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </p>

          <form onSubmit={handleAuth}>

            {isRegister && (
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit">
              {isRegister ? "Create Account" : "Login"}
            </button>

          </form>

          {message && (
            <p className="message">{message}</p>
          )}

          <button
            className="switch-button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>

        </div>

      </div>
    );
  }

  return <Dashboard token={token} logout={logout} />;
}


function Dashboard({ token, logout }) {

const [jobs, setJobs] = useState([]);

const [showForm, setShowForm] = useState(false);

const [editingJob, setEditingJob] = useState(null);

const [search, setSearch] = useState("");

const [filterStatus, setFilterStatus] = useState("All");

// AI + Resume
const [showAI, setShowAI] = useState(false);

const [resume, setResume] = useState(null);

const [resumeFile, setResumeFile] = useState(null);

const [aiJobDescription, setAiJobDescription] = useState("");

const [aiResult, setAiResult] = useState(null);

const [aiLoading, setAiLoading] = useState(false);

const [resumeLoading, setResumeLoading] = useState(false);

const [aiError, setAiError] = useState("");

  const [form, setForm] = useState({
    company: "",
    position: "",
    jobUrl: "",
    status: "Applied",
    salary: "",
    notes: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchResume();
}, []);

const handleResumeUpload = async () => {
    if (!resumeFile) {
        alert("Please select a PDF resume.");
        return;
    }

    setResumeLoading(true);

    try {
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("resume", resumeFile);

        const response = await fetch(
            "http://localhost:5000/api/resume/upload",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed");
        }

        alert("Resume uploaded successfully!");

        setResumeFile(null);

        fetchResume();

    } catch (error) {
        alert(error.message);
    } finally {
        setResumeLoading(false);
    }
};

const analyzeJob = async () => {
    if (aiJobDescription.trim().length < 20) {
        setAiError("Please enter a valid job description.");
        return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/ai/analyze",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    jobDescription: aiJobDescription,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "AI analysis failed");
        }

        setAiResult(data);

    } catch (error) {
        setAiError(error.message);
    } finally {
        setAiLoading(false);
    }
};

  const fetchResume = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/resume",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch resume");
        }

        const data = await response.json();

        setResume(data);

    } catch (error) {
        console.error(error);
    }
};

  

  async function fetchJobs() {

    try {

      const response = await fetch(
        `${API_URL}/api/jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJobs(data);
      } else if (response.status === 401 || response.status === 403) {
        logout();
      }

    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }

  async function addJob(e) {

    e.preventDefault();

    try {

      const response = await fetch(
        `${API_URL}/api/jobs`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (response.ok) {

        setJobs([data, ...jobs]);

        setForm({
          company: "",
          position: "",
          jobUrl: "",
          status: "Applied",
          salary: "",
          notes: "",
        });

        setShowForm(false);

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.error(error);

    }
  }

  async function editJob(e) {
    e.preventDefault();

    try {
        const response = await fetch(
            `${API_URL}/api/jobs/${editingJob.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            }
        );

        const data = await response.json();

        if (response.ok) {
            setJobs(
                jobs.map((job) =>
                    job.id === editingJob.id ? data : job
                )
            );

            setEditingJob(null);
            setShowForm(false);

            setForm({
                company: "",
                position: "",
                jobUrl: "",
                status: "Applied",
                salary: "",
                notes: "",
            });
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
    }
}

  async function deleteJob(id) {

    if (!window.confirm("Delete this application?")) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/jobs/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {

        setJobs(
          jobs.filter((job) => job.id !== id)
        );

      }

    } catch (error) {

      console.error(error);

    }
  }

  const total = jobs.length;

  const applied = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const interviews = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const selected = jobs.filter(
    (job) => job.status === "Selected"
  ).length;

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
        job.company
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        job.position
            .toLowerCase()
            .includes(search.toLowerCase());

    const matchesStatus =
        filterStatus === "All" ||
        job.status === filterStatus;

    return matchesSearch && matchesStatus;
});

  return (

    <div className="app">

      <header className="header">

        <div>
          <h1>AI Job Tracker</h1>
          <p>Track your job applications in one place.</p>
        </div>

        <div className="header-buttons">

  <button
    className="ai-button"
    onClick={() => setShowAI(!showAI)}
  >
    🤖 AI Job Analyzer
  </button>

  <button
    className="add-button"
    onClick={() => setShowForm(!showForm)}
  >
    + Add Job
  </button>

  <button
    className="logout-button"
    onClick={logout}
  >
    Logout
  </button>

</div>

      </header>


      <section className="stats">

        <div className="stat-card">
          <h3>Total Applications</h3>
          <strong>{total}</strong>
        </div>

        <div className="stat-card">
          <h3>Applied</h3>
          <strong>{applied}</strong>
        </div>

        <div className="stat-card">
          <h3>Interviews</h3>
          <strong>{interviews}</strong>
        </div>

        <div className="stat-card">
          <h3>Selected</h3>
          <strong>{selected}</strong>
        </div>

      </section>

  <div className="ai-section">

    <div className="ai-header">
        <div>
            <h2>🤖 AI Resume Analyzer</h2>
            <p>
                Compare your resume with a job description using AI.
            </p>
        </div>
    </div>


    {/* Resume Card */}
    <div className="resume-card">

        <div className="resume-card-header">
            <div>
                <h3>Your Resume</h3>
                <p>
                    Upload your resume to get personalized job matching.
                </p>
            </div>
        </div>

        {resume ? (
            <div className="resume-uploaded">
                <span className="resume-icon">📄</span>

                <div className="resume-info">
                    <strong>{resume.fileName}</strong>
                    <span>Resume uploaded successfully</span>
                </div>

                <span className="resume-check">✓</span>
            </div>
        ) : (
            <div className="resume-empty">
                <span>📄</span>
                <p>No resume uploaded yet.</p>
            </div>
        )}

        <div className="resume-upload-controls">

            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
            />

            <button
                className="upload-btn"
                onClick={handleResumeUpload}
                disabled={resumeLoading}
            >
                {resumeLoading
                    ? "Uploading..."
                    : "Upload / Replace Resume"}
            </button>

        </div>

    </div>


    {/* Job Description */}
    <div className="job-analyzer-card">

        <h3>Analyze a Job</h3>

        <p className="section-description">
            Paste the job description below and we'll compare it
            against your resume.
        </p>

        <textarea
            className="job-description-input"
            placeholder="Paste the complete job description here..."
            value={aiJobDescription}
            onChange={(e) => setAiJobDescription(e.target.value)}
            rows="10"
        />

        {aiError && (
            <div className="ai-error">
                {aiError}
            </div>
        )}

        <button
            className="analyze-btn"
            onClick={analyzeJob}
            disabled={aiLoading}
        >
            {aiLoading ? "🤖 Analyzing..." : "✨ Analyze Job"}
        </button>

    </div>


    {/* AI Result */}
    {aiResult && (
        <div className="ai-result-card">

            <div className="result-header">
                <div>
                    <h3>AI Analysis</h3>
                    <p>Personalized analysis based on your resume</p>
                </div>
            </div>


            {/* Match Score */}
            <div className="match-score-section">

                <div className="score-circle">
                    <span>{aiResult.matchScore}%</span>
                </div>

                <div>
                    <h3>Resume Match Score</h3>
                    <p>
                        Your resume matches approximately{" "}
                        <strong>{aiResult.matchScore}%</strong>{" "}
                        of this job's requirements.
                    </p>
                </div>

            </div>


            {/* Summary */}
            <div className="result-block">

                <h4>📋 Summary</h4>

                <p>
                    {aiResult.summary}
                </p>

            </div>


            {/* Skills */}
            <div className="skills-grid">

                <div className="result-block">

                    <h4>✓ Matching Skills</h4>

                    {aiResult.matchingSkills?.length > 0 ? (
                        <div className="skill-list">

                            {aiResult.matchingSkills.map(
                                (skill, index) => (
                                    <span
                                        className="skill-tag matching"
                                        key={index}
                                    >
                                        {skill}
                                    </span>
                                )
                            )}

                        </div>
                    ) : (
                        <p>No matching skills found.</p>
                    )}

                </div>


                <div className="result-block">

                    <h4>⚠ Missing Skills</h4>

                    {aiResult.missingSkills?.length > 0 ? (
                        <div className="skill-list">

                            {aiResult.missingSkills.map(
                                (skill, index) => (
                                    <span
                                        className="skill-tag missing"
                                        key={index}
                                    >
                                        {skill}
                                    </span>
                                )
                            )}

                        </div>
                    ) : (
                        <p>No major missing skills identified.</p>
                    )}

                </div>

            </div>


            {/* Experience Gaps */}
            <div className="result-block">

                <h4>🎯 Experience Gaps</h4>

                {aiResult.experienceGaps?.length > 0 ? (
                    <ul className="experience-list">

                        {aiResult.experienceGaps.map(
                            (gap, index) => (
                                <li key={index}>
                                    {gap}
                                </li>
                            )
                        )}

                    </ul>
                ) : (
                    <p>No significant experience gaps identified.</p>
                )}

            </div>


            {/* Recommendation */}
            <div className="recommendation">

                <h4>💡 Recommendation</h4>

                <p>
                    {aiResult.recommendation}
                </p>

            </div>

        </div>
    )}

</div>

      {showAI && (

  <section className="ai-card">

    <h2>🤖 AI Job Analyzer</h2>

    <p>
      Paste a job description and let AI analyze
      how well the role matches your skills.
    </p>

    <textarea
      className="ai-input"
      placeholder="Paste the job description here..."
      value={jobDescription}
      onChange={(e) => setJobDescription(e.target.value)}
    />

    <button
      className="analyze-button"
      onClick={analyzeJob}
      disabled={aiLoading}
    >
      {aiLoading ? "Analyzing..." : "Analyze Job"}
    </button>


    {analysis && (

      <div className="analysis-result">

        <div className="match-score">
          <span>Match Score</span>
          <strong>{analysis.matchScore}%</strong>
        </div>

        <div>
          <h3>Summary</h3>
          <p>{analysis.summary}</p>
        </div>

        <div>
          <h3>Matching Skills</h3>

          <div className="skills">
            {analysis.matchingSkills.map(
              (skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <h3>Missing Skills</h3>

          <div className="skills">
            {analysis.missingSkills.map(
              (skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <h3>Recommendation</h3>
          <p>{analysis.recommendation}</p>
        </div>

      </div>

    )}

  </section>

)}


      {showForm && (

        <section className="form-card">

<h2>
  {editingJob
    ? "Edit Job Application"
    : "Add Job Application"}
</h2>
<form onSubmit={editingJob ? editJob : addJob}>
            <input
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
              required
            />

            <input
              name="position"
              placeholder="Position"
              value={form.position}
              onChange={handleChange}
              required
            />

            <input
              name="jobUrl"
              placeholder="Job URL"
              value={form.jobUrl}
              onChange={handleChange}
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Applied</option>
              <option>OA</option>
              <option>Interview</option>
              <option>Rejected</option>
              <option>Selected</option>
            </select>

            <input
              name="salary"
              placeholder="Salary"
              value={form.salary}
              onChange={handleChange}
            />

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
            />

            <button type="submit">
  {editingJob ? "Update Application" : "Save Application"}
</button>

          </form>

        </section>

      )}

      <div className="job-controls">

  <input
    type="text"
    placeholder="Search company or position..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="All">All Statuses</option>
    <option value="Applied">Applied</option>
    <option value="OA">OA</option>
    <option value="Interview">Interview</option>
    <option value="Rejected">Rejected</option>
    <option value="Selected">Selected</option>
  </select>

</div>
      <section className="jobs">

        <h2>My Applications</h2>

        {filteredJobs.length === 0 ? (

          <div className="empty">

            <p>No applications yet.</p>

            <p>
              Click "+ Add Job" to add your first application.
            </p>

          </div>

        ) : (

          filteredJobs.map((job) => (

            <div
              className="job-card"
              key={job.id}
            >

              <div>

                <h3>{job.position}</h3>

                <p className="company">
                  {job.company}
                </p>

                <p>
                  Status: <strong>{job.status}</strong>
                </p>

                {job.salary && (
                  <p>Salary: {job.salary}</p>
                )}

                {job.notes && (
                  <p>Notes: {job.notes}</p>
                )}

                {job.jobUrl && (

                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Job
                  </a>

                )}

              </div>

              <div className="job-actions">

  <button
    className="edit-button"
    onClick={() => {
      setEditingJob(job);

      setForm({
        company: job.company,
        position: job.position,
        jobUrl: job.jobUrl || "",
        status: job.status,
        salary: job.salary || "",
        notes: job.notes || "",
      });

      setShowForm(true);
    }}
  >
    Edit
  </button>

  <button
    className="delete-button"
    onClick={() => deleteJob(job.id)}
  >
    Delete
  </button>

</div>

            </div>

          ))

        )}

      </section>

    </div>

  );
}

export default App;