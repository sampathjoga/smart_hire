const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');

dotenv.config();

const jobsData = [
    {
        job_title: "Software Engineer, Backend",
        company_name: "Coinbase",
        job_location: "Remote",
        employment_type: "Full-time",
        experience_required: "Intermediate / Senior",
        skills_required: ["Backend Development", "Go", "Ruby", "Distributed Systems", "Cloud Infrastructure"],
        salary_range: "Competitive",
        job_description: "Drive the development of Coinbase's core trading and financial services backend. Focus on scalability, security, and high-performance distributed systems in a remote-first environment.",
        apply_link: "https://www.coinbase.com/careers",
        source_type: "Company Site",
        category: "IT",
        tags: ["Crypto", "Remote", "High-Scale"],
        is_remote: true,
        is_fresher_friendly: false
    },
    {
        job_title: "Infrastructure Software Engineer",
        company_name: "Dropbox",
        job_location: "Remote",
        employment_type: "Full-time",
        experience_required: "3-5+ years",
        skills_required: ["Infrastructure", "Python", "Go", "Rust", "Distributed Systems", "Kubernetes"],
        salary_range: "Market Rate",
        job_description: "Build and maintain the foundational infrastructure that powers Dropbox. Responsible for reliability, performance, and automation of large-scale storage and compute systems.",
        apply_link: "https://www.dropbox.com/jobs",
        source_type: "Company Site",
        category: "IT",
        tags: ["Storage", "Cloud", "SaaS"],
        is_remote: true,
        is_fresher_friendly: false
    },
    {
        job_title: "Software Engineer (Full Stack)",
        company_name: "Arcadia",
        job_location: "Remote / New York, NY",
        employment_type: "Full-time",
        experience_required: "2+ years",
        skills_required: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
        salary_range: "Available on request",
        job_description: "Join the team building a data-driven platform for the clean energy future. Work across the stack to deliver user-facing features and robust API services.",
        apply_link: "https://www.arcadia.com/careers",
        source_type: "Company Site",
        category: "IT",
        tags: ["CleanTech", "Full-Stack", "Green-Energy"],
        is_remote: true,
        is_fresher_friendly: false
    },
    {
        job_title: "Software Engineer I, Backend (New Grad - 2025)",
        company_name: "Flex",
        job_location: "Chicago, IL / Seattle, WA",
        employment_type: "Internship",
        experience_required: "Recent Graduate",
        skills_required: ["Java", "Python", "Data Structures", "Algorithms", "Problem Solving"],
        salary_range: "Competitive Hourly",
        job_description: "Entry-level backend role focusing on system design, code quality, and learning scalable architecture. Open to 2025 graduates with strong CS fundamentals.",
        apply_link: "https://www.flex.com/careers",
        source_type: "Company Site",
        category: "Internship",
        tags: ["New-Grad", "Mentorship", "Big-Tech"],
        is_remote: false,
        is_fresher_friendly: true
    },
    {
        job_title: "Data Analyst",
        company_name: "Ministry of National Food Security & Research",
        job_location: "Islamabad, Pakistan",
        employment_type: "Full-time",
        experience_required: "2+ years",
        skills_required: ["Data Analysis", "Statistical Modeling", "SQL", "Policy Research"],
        salary_range: "Government Scale",
        job_description: "Analyze agricultural and food security data to inform national policy and research initiatives. Collaborate with various government departments for data-driven insights.",
        apply_link: "https://njp.gov.pk",
        source_type: "Govt Portal",
        category: "Government",
        tags: ["Govt", "Data-Science", "National-Policy"],
        is_remote: false,
        is_fresher_friendly: false
    }
];

const seedJobs = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobboard';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        await Job.deleteMany();
        await Job.insertMany(jobsData);

        console.log('Jobs seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding jobs:', err.message);
        process.exit(1);
    }
};

seedJobs();
