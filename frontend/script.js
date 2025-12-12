// ===== API ENDPOINTS =====
const API_BASE = "http://localhost:3000";
const AUTH_REGISTER_URL = `${API_BASE}/api/auth/register`;
const AUTH_LOGIN_URL = `${API_BASE}/api/auth/login`;
const JOB_SEARCH_URL = `${API_BASE}/jobs`;
const RESUME_ANALYZE_URL = `${API_BASE}/analyze-resume`;


// ===== TOKEN HELPERS =====
function saveToken(token) {
  if (!token) return;
  localStorage.setItem("smarthire_token", token);
}

function getToken() {
  return localStorage.getItem("smarthire_token") || "";
}

function buildAuthHeaders(extra = {}) {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, ...extra } : extra;
}


// ===== PAGE LOADED =====
document.addEventListener("DOMContentLoaded", () => {
  setupRegisterPage();
  setupLoginPage();
  setupHomePage();
});


// ======================================================
//  REGISTER PAGE LOGIC  (register.html)
// ======================================================
function setupRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const message = document.getElementById("registerMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    message.textContent = "Analyzing resume & registering...";
    message.className = "auth-message";

    try {
      const res = await fetch(AUTH_REGISTER_URL, {
        method: "POST",
        body: formData, // Includes file + fields
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || "Registration failed";
        message.textContent = msg;
        message.classList.add("error");
        alert(msg); // popup required
        return;
      }

      // Registration success
      message.textContent = `Success! ATS Score: ${data.atsScore}. Redirecting…`;
      message.classList.add("success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } catch (err) {
      console.error("Register error:", err);
      message.textContent = "Network error";
      message.classList.add("error");
      alert("Network error. Please try again.");
    }
  });
}


// ======================================================
//  LOGIN PAGE LOGIC  (login.html)
// ======================================================
function setupLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value.trim(),
    };

    message.textContent = "Signing in…";
    message.className = "auth-message";

    try {
      const res = await fetch(AUTH_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) saveToken(data.token);

      message.textContent = "Login Successful! Redirecting…";
      message.classList.add("success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (err) {
      message.textContent = err.message;
      message.classList.add("error");
    }
  });
}


// ======================================================
//  HOME PAGE LOGIC  (index.html)
// ======================================================
function setupHomePage() {
  setupJobSearch();
  setupResumeAnalyzer();
}


// ---------- Job Search ----------
function setupJobSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const grid = document.getElementById("jobsGrid");
  if (!form || !input || !grid) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const query = input.value.trim();
    if (!query) return;

    try {
      const res = await fetch(`${JOB_SEARCH_URL}?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        renderJobs(data.jobs, grid);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  });
}


// ---------- AI Resume Analyzer (Home Page) ----------
function setupResumeAnalyzer() {
  const form = document.getElementById("resumeForm");
  const input = document.getElementById("resumeInput");
  const fileLabel = document.getElementById("fileLabelText");
  const resultBox = document.getElementById("analysisResult");
  const grid = document.getElementById("jobsGrid");

  if (!form || !input || !fileLabel || !resultBox) return;

  input.addEventListener("change", () => {
    const file = input.files[0];
    fileLabel.textContent = file ? file.name : "Upload resume (PDF / DOCX)";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = input.files[0];
    if (!file) return alert("Upload a resume first!");

    const fd = new FormData();
    fd.append("resume", file);

    resultBox.innerHTML = "<p>Analyzing with AI...</p>";

    try {
      const res = await fetch(RESUME_ANALYZE_URL, {
        method: "POST",
        body: fd,
        headers: buildAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Analysis failed");

      const parsed = data.parsed || {};
      resultBox.innerHTML = `
        <h3>AI Resume Analysis</h3>
        <p><strong>Summary:</strong> ${parsed.summary || "Unavailable"}</p>
        <p><strong>Score:</strong> ${parsed.score ?? "N/A"}</p>
        <p><strong>Skills:</strong> ${
          parsed.skills?.length ? parsed.skills.join(", ") : "None"
        }</p>
      `;

      if (Array.isArray(data.recommendedJobs)) {
        renderJobs(data.recommendedJobs, grid);
      }
    } catch (err) {
      console.error(err);
      resultBox.innerHTML = `<p style="color:#fca5a5;">${err.message}</p>`;
    }
  });
}


// ======================================================
// JOB CARD RENDERER
// ======================================================
function renderJobs(jobs, container) {
  container.innerHTML = "";

  if (!jobs.length) {
    container.innerHTML =
      "<p style='color:#9ca3af;'>No jobs found for this search.</p>";
    return;
  }

  jobs.forEach((job) => {
    const card = document.createElement("article");
    card.className = "job-card";
    card.innerHTML = `
      <h3>${job.title || "Job Title"}</h3>
      <p class="company">${
        job.company || "Company"
      }${job.location ? " • " + job.location : ""}</p>
      <p class="meta">${job.type || "Full-time"}${
      job.salaryRange ? " · " + job.salaryRange : ""
    }</p>
    `;
    container.appendChild(card);
  });
}
