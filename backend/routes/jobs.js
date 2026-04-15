const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');

// Middleware for employer
const employerAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied: Employers only' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// @route   GET api/jobs
// @desc    Get all jobs with filters
router.get('/', async (req, res) => {
    try {
        const { category, is_remote, is_fresher_friendly, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (is_remote === 'true') {
            query.is_remote = true;
        }

        if (is_fresher_friendly === 'true') {
            query.is_fresher_friendly = true;
        }

        if (search) {
            query.$or = [
                { job_title: { $regex: search, $options: 'i' } },
                { company_name: { $regex: search, $options: 'i' } },
                { job_description: { $regex: search, $options: 'i' } }
            ];
        }

        const jobs = await Job.find(query).sort({ date_posted: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs/categories
// @desc    Get all available categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Job.distinct('category');
        res.json(['All', ...categories]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/jobs/create
// @desc    Create a job posting (Employer only)
router.post('/create', employerAuth, async (req, res) => {
    try {
        const { job_title, company_name, job_location, employment_type, experience_required, skills_required, salary_range, job_description, is_remote, category, apply_link } = req.body;
        
        const newJob = new Job({
            job_title,
            company_name,
            job_location,
            employment_type,
            experience_required,
            skills_required: Array.isArray(skills_required) ? skills_required : (skills_required ? skills_required.split(',').map(skill => skill.trim()) : []),
            salary_range,
            job_description,
            is_remote,
            category,
            apply_link: apply_link || '',
            postedBy: req.user.id
        });
        
        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs/my
// @desc    Get jobs posted by the employer
router.get('/my', employerAuth, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ date_posted: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
