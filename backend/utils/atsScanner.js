/**
 * Refined ATS Scanner Logic
 * Ported from srikarnarayanempati/ats-score-generator
 */

const CATEGORY_KEYWORDS = {
    "frontend": ["javascript", "typescript", "react", "redux", "vue", "angular", "html", "css", "webpack", "vite", "unit testing", "jest", "cypress", "accessibility", "responsive", "performance"],
    "backend": ["node", "express", "java", "spring", "django", "flask", "golang", "postgres", "mysql", "mongodb", "rest", "graphql", "microservices", "redis", "kafka", "docker"],
    "fullstack": ["react", "node", "express", "rest", "graphql", "postgres", "docker", "aws", "ci/cd", "typescript", "testing"],
    "data-science": ["python", "pandas", "numpy", "scikit", "tensorflow", "pytorch", "ml", "model", "classification", "regression", "nlp", "computer vision", "feature engineering", "hyperparameter", "cross-validation"],
    "data-analytics": ["sql", "excel", "tableau", "power bi", "python", "pandas", "dashboards", "reporting", "kpi", "ab testing", "statistics"],
    "devops": ["aws", "gcp", "azure", "terraform", "kubernetes", "docker", "ci/cd", "jenkins", "ansible", "monitoring", "prometheus", "grafana"],
    "mobile": ["android", "kotlin", "java", "ios", "swift", "react native", "flutter", "xcode", "play store", "app store"],
    "product": ["roadmap", "prioritization", "stakeholder", "kpi", "user research", "a/b", "experimentation", "backlog", "go-to-market"],
    "qa": ["test plans", "automation", "selenium", "cypress", "pytest", "junit", "defects", "regression", "integration testing"],
    "security": ["threat", "vulnerability", "owasp", "siem", "ids", "ips", "encryption", "iam", "zero trust", "iso 27001"],
    "ui-ux": ["figma", "sketch", "adobe xd", "user research", "wireframing", "prototyping", "usability testing", "design systems", "accessibility"],
    "other": ["leadership", "communication", "project management", "problem solving", "collaboration", "innovation"]
};

const VERBS = ["led", "created", "built", "improved", "developed", "managed", "optimized", "designed", "launched", "achieved", "reduced", "increased", "delivered", "orchestrated", "accelerated", "streamlined", "drove"];

const SECTIONS = ["summary", "objective", "experience", "work experience", "education", "skills", "projects", "certifications", "languages", "contact"];

const extractYearsFromText = (text) => {
    const lower = text.toLowerCase();
    let years = 0;
    const patterns = [
        /(\d{1,2})\s*\+?\s*(?:years|yrs)\s*(?:of)?\s*experience/gi,
        /(\d{1,2})\s*\+?\s*(?:years|yrs)/gi,
    ];
    patterns.forEach((re) => {
        let m;
        while ((m = re.exec(lower)) !== null) {
            years = Math.max(years, parseInt(m[1], 10));
        }
    });
    return Math.min(years, 40);
};

const scoreRoleMatch = (text, category) => {
    const lower = text.toLowerCase();
    const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["other"];
    let hits = 0;
    keywords.forEach(k => { if (lower.includes(k)) hits++; });
    return Math.round((hits / keywords.length) * 100);
};

const scoreExperienceFit = (text, targetYears) => {
    const resumeYears = extractYearsFromText(text);
    const desired = parseInt(targetYears, 10) || 0;
    if (!desired) return Math.max(0, 60 - 10 * (resumeYears === 0 ? 1 : 0));

    const diff = Math.abs(resumeYears - desired);
    let score = 100;
    if (diff === 0) score = 100;
    else if (diff === 1) score = 85;
    else if (diff === 2) score = 70;
    else if (diff === 3) score = 55;
    else score = 40;

    const lower = text.toLowerCase();
    if (desired <= 2 && /(senior|lead|staff|principal)/.test(lower)) score -= 15;
    if (desired >= 7 && /(junior|entry)/.test(lower)) score -= 15;
    return Math.max(0, Math.min(100, score));
};

const scoreLayout = (text) => {
    const lower = text.toLowerCase();
    let score = 100;
    if (!lower.includes("summary") && !lower.includes("objective")) score -= 20;
    if (!lower.includes("experience") && !lower.includes("work experience")) score -= 30;
    if (!lower.includes("education")) score -= 20;
    if (!lower.includes("skills")) score -= 15;

    if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) score -= 10;
    if (!/(\+?\d[\d\s\-()]{7,}\d)/.test(text)) score -= 10;

    return Math.max(0, score);
};

const scoreImpact = (text) => {
    const lower = text.toLowerCase();
    let verbMatches = 0;
    VERBS.forEach(v => { if (lower.includes(v)) verbMatches++; });
    const metrics = (lower.match(/(\d+%|\$\d+[kKmM]?|\d+\s*(?:users|requests|deals|projects|releases))/g) || []).length;

    let score = 40 + Math.min(verbMatches * 8, 40) + Math.min(metrics * 10, 20);
    if (verbMatches < 2) score -= 10;
    if (metrics < 1) score -= 10;
    return Math.max(0, Math.min(100, Math.round(score)));
};

const scoreCrispness = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    let score = 100;
    if (words > 1000) score -= 35;
    else if (words > 800) score -= 25;
    else if (words < 150) score -= 20;

    if (sentences > 80) score -= 20;
    else if (sentences < 10) score -= 15;
    return Math.max(0, score);
};

const scanResume = (text, category, targetYears) => {
    if (!text) return { totalScore: 0, breakdown: {} };

    const roleMatch = scoreRoleMatch(text, category);
    const experienceFit = scoreExperienceFit(text, targetYears);
    const layoutScore = scoreLayout(text);
    const impactScore = scoreImpact(text);
    const crispnessScore = scoreCrispness(text);

    const totalScore = Math.min(100, Math.round(
        0.35 * roleMatch +
        0.20 * experienceFit +
        0.25 * layoutScore +
        0.15 * impactScore +
        0.05 * crispnessScore
    ) + 10);

    return {
        totalScore,
        breakdown: {
            roleMatch,
            experienceFit,
            layoutScore,
            impactScore,
            crispnessScore
        }
    };
};

module.exports = { scanResume };
