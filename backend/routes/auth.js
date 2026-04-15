const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const User = require('../models/User');
const { scanResume } = require('../utils/atsScanner');

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

// Register
router.post('/register', upload.single('resume'), async (req, res) => {
    try {
        const { fullName, email, password, phone, jobCategory, yearsExperience } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Resume PDF is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Parse PDF for ATS Score
        const dataBuffer = fs.readFileSync(req.file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        await parser.destroy();

        const { totalScore, breakdown } = scanResume(data.text, jobCategory, yearsExperience);

        // ATS Condition: Score must be >= 50
        if (totalScore < 50) {
            // Clean up uploaded file if registration fails
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: 'Registration Failed – Your resume ATS score is too low.',
                atsScore: totalScore,
                breakdown,
                suggestion: 'Please improve your resume and try again.'
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone,
            resumeUrl: req.file.path,
            atsScore: totalScore,
            jobCategory: jobCategory || 'other',
            yearsExperience: parseInt(yearsExperience) || 0
        });

        await newUser.save();


        // Create JWT
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                atsScore: newUser.atsScore
            },
            message: `Registration Successful – Your ATS Score is ${totalScore}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                atsScore: user.atsScore
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
