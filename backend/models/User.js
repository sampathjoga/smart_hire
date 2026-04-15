const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'employer'], default: 'candidate' },
    companyName: { type: String },
    resumeUrl: { type: String },
    atsScore: { type: Number, default: 0 },
    jobCategory: { type: String, default: 'other' },
    yearsExperience: { type: Number, default: 0 },
    skills: { type: [String], default: [] },

    projects: { type: [String], default: [] },
    domain: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
