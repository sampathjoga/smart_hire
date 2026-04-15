const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');

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

// Register Employer
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, phone, companyName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone,
            companyName,
            role: 'employer'
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                companyName: newUser.companyName
            },
            message: 'Employer Registration Successful'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Employer
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || user.role !== 'employer') {
            return res.status(400).json({ message: 'Invalid credentials or not an employer' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Applications for Employer
router.get('/applications', employerAuth, async (req, res) => {
    try {
         const applications = await Application.find({ employerId: req.user.id })
            .populate('userId', 'fullName email phone resumeUrl skills atsScore')
            .populate('jobId', 'job_title company_name')
            .sort({ createdAt: -1 });
            
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Application Status
router.patch('/application/:id', employerAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const io = req.app.get('io');
        
        let application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        if (application.employerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        application.status = status;
        await application.save();
        
        await application.populate('jobId', 'job_title');

        if (io) {
            io.to(application.userId.toString()).emit('statusUpdate', {
                applicationId: application._id,
                jobTitle: application.jobId.job_title,
                status: application.status
            });
        }

        res.json(application);
    } catch (err) {
         console.error(err);
         res.status(500).json({ message: 'Server error' });
    }
});

// Get Employer Analytics
router.get('/analytics', employerAuth, async (req, res) => {
    try {
        const applications = await Application.find({ employerId: req.user.id });
        
        const totalApplicants = applications.length;
        const selectedCount = applications.filter(app => app.status === 'Selected' || app.status === 'Offer').length;
        const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
        const interviewCount = applications.filter(app => app.status === 'Interview').length;
        const appliedCount = applications.filter(app => app.status === 'Applied').length;
        
        res.json({
            totalApplicants,
            selectedCount,
            rejectedCount,
            interviewCount,
            appliedCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
