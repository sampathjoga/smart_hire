
// Set worker source to local public file copied from node_modules
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source to local public file copied from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

import mammoth from 'mammoth';

// --- Text Extraction ---

async function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function extractTextFromPDF(arrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        text += strings.join(" ") + "\n";
    }
    return text;
}

async function extractTextFromDocx(arrayBuffer) {
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value || "";
}

export async function parseResumeToText(file) {
    const buffer = await readFileAsArrayBuffer(file);
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".pdf")) {
        return await extractTextFromPDF(buffer);
    }
    if (name.endsWith(".docx")) {
        return await extractTextFromDocx(buffer);
    }
    return new TextDecoder().decode(buffer); // Fallback for txt
}


// --- Scoring Logic (Ported from script.js) ---

// Helper functions from the generator
function countBulletLines(text) {
    return (text || "").split(/\n|\r/).filter((line) => /^[\u2022\-*•]/.test(line.trim())).length;
}

function extractEmail(text) {
    const match = (text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0] : null;
}

function extractPhone(text) {
    const match = (text || "").match(/(\+?\d[\d\s\-()]{7,}\d)/);
    return match ? match[0] : null;
}

function extractYearsFromText(text) {
    const lower = (text || "").toLowerCase();
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
}

// NOTE: Hardcoded "other" keywords as per user's tuned version
function roleKeywords() {
    return ["leadership", "communication", "project", "management", "problem", "solving", "collaboration", "innovation", "development", "software", "technology", "experience", "worked", "university", "skills", "team"];
}

function scoreRoleMatch(text) {
    const lower = (text || "").toLowerCase();
    const kws = roleKeywords();
    let hits = 0;
    kws.forEach((k) => {
        if (lower.includes(k)) hits += 1;
    });
    const coverage = kws.length ? hits / kws.length : 0;
    let score = Math.round(100 * coverage);
    return Math.max(0, Math.min(100, score));
}

function scoreExperienceFit(text) {
    const resumeYears = extractYearsFromText(text);
    // Tuned Logic: return high baseline if years not explicitly 0
    return Math.max(50, 90 - 10 * (resumeYears === 0 ? 1 : 0));
}

function scoreLayout(text) {
    const presence = detectSectionPresence(text);
    let score = 100;
    if (!presence["summary"] && !presence["objective"]) score -= 20;
    if (!presence["experience"] && !presence["work experience"]) score -= 30;
    if (!presence["education"]) score -= 20;
    if (!presence["skills"]) score -= 15;

    if (!extractEmail(text)) score -= 10;
    if (!extractPhone(text)) score -= 10;
    if (countBulletLines(text) < 5) score -= 10;

    return Math.max(0, Math.min(100, score));
}

function detectSectionPresence(text) {
    const lower = (text || "").toLowerCase();
    const sections = ["summary", "objective", "experience", "work experience", "education", "skills", "projects", "certifications", "languages", "contact"];
    const present = {};
    sections.forEach((s) => {
        present[s] = lower.includes(s);
    });
    return present;
}

function scoreImpact(text) {
    const lower = (text || "").toLowerCase();
    const verbs = [
        "led", "created", "built", "improved", "developed", "managed",
        "optimized", "designed", "launched", "achieved", "reduced", "increased",
        "delivered", "orchestrated", "accelerated", "streamlined", "drove"
    ];
    let verbMatches = 0;
    verbs.forEach((v) => {
        if (lower.includes(v)) verbMatches += 1;
    });
    const metrics = (lower.match(/(\d+%|\$\d+[kKmM]?|\d+\s*(?:users|requests|deals|projects|releases))/g) || []).length;

    let score = 40 + Math.min(verbMatches * 8, 40) + Math.min(metrics * 10, 20);
    if (verbMatches < 2) score -= 10;
    if (metrics < 1) score -= 10;
    return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreCrispness(text) {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
    const sentences = (text || "").split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    let score = 100;
    if (words > 1000) score -= 35;
    else if (words > 800) score -= 25;
    else if (words < 150) score -= 20;

    if (sentences > 80) score -= 20;
    else if (sentences < 10) score -= 15;

    return Math.max(0, Math.min(100, score));
}

export function calculateATSScore(text) {
    const roleMatch = scoreRoleMatch(text);
    const experienceFit = scoreExperienceFit(text);
    const layoutScore = scoreLayout(text);
    const impactScore = scoreImpact(text);
    const crispnessScore = scoreCrispness(text);

    // Tuned Weights
    const atsScore = Math.max(50, Math.round(
        0.15 * roleMatch +
        0.10 * experienceFit +
        0.40 * layoutScore +
        0.25 * impactScore +
        0.10 * crispnessScore
    ));

    return { atsScore, layoutScore, impactScore, crispnessScore, roleMatch, experienceFit };
}
