const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const User = require('../models/User');
const { scanResume } = require('../utils/atsScanner');

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

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Get User Profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile
router.put('/', auth, upload.single('resume'), async (req, res) => {
    try {
        const { fullName, email, phone, skills, projects, domain, jobCategory, yearsExperience } = req.body;

        const updateData = {
            fullName,
            email,
            phone,
            domain,
            jobCategory,
            yearsExperience: parseInt(yearsExperience) || 0,
            skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
            projects: projects ? (Array.isArray(projects) ? projects : projects.split(',').map(p => p.trim())) : []
        };

        const user = await User.findById(req.user.id);
        const currentJobCategory = jobCategory || user.jobCategory;
        const currentYears = yearsExperience !== undefined ? yearsExperience : user.yearsExperience;

        if (req.file) {
            updateData.resumeUrl = req.file.path;
            const dataBuffer = fs.readFileSync(req.file.path);
            const parser = new PDFParse({ data: dataBuffer });
            const data = await parser.getText();
            await parser.destroy();
            const { totalScore: newAtsScore } = scanResume(data.text, currentJobCategory, currentYears);
            updateData.atsScore = newAtsScore;
        } else if (jobCategory || yearsExperience !== undefined) {
            // Re-calculate score if category or experience changed even if resume is the same
            if (user.resumeUrl && fs.existsSync(user.resumeUrl)) {
                const dataBuffer = fs.readFileSync(user.resumeUrl);
                const parser = new PDFParse({ data: dataBuffer });
                const data = await parser.getText();
                await parser.destroy();
                const { totalScore: newAtsScore } = scanResume(data.text, currentJobCategory, currentYears);
                updateData.atsScore = newAtsScore;
            }
        }


        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(updatedUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
