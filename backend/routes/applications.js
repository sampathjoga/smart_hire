const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// @route   POST /api/applications/apply/:jobId
// @desc    Record a new application
router.post('/apply/:jobId', auth, async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if already applied
        const existingApp = await Application.findOne({ userId: req.user.id, jobId });
        if (existingApp) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }
        
        const job = await Job.findById(jobId);
        if (!job) {
             return res.status(404).json({ message: 'Job not found' });
        }

        const newApplication = new Application({
            userId: req.user.id,
            jobId,
            employerId: job.postedBy,
            status: 'Applied'
        });

        const application = await newApplication.save();

        // Populate for real-time emit
        await application.populate('userId', 'fullName email phone atsScore');
        await application.populate('jobId', 'job_title company_name');

        const io = req.app.get('io');
        if (io && job.postedBy) {
            io.to(job.postedBy.toString()).emit('newApplication', application);
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/applications
// @desc    Get user's applications with analytics
router.get('/', auth, async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user.id })
            .populate('jobId')
            .sort({ createdAt: -1 });

        // Calculate analytics
        const analytics = {
            total: applications.length,
            applied: applications.filter(a => a.status === 'Applied').length,
            interview: applications.filter(a => a.status === 'Interview').length,
            offer: applications.filter(a => a.status === 'Offer').length,
            rejected: applications.filter(a => a.status === 'Rejected').length
        };

        res.json({ applications, analytics });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/applications/:id
// @desc    Update application status
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;

        let application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check user ownership
        if (application.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
