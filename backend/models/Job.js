const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    job_title: {
        type: String,
        required: true,
        trim: true
    },
    company_name: {
        type: String,
        required: true,
        trim: true
    },
    job_location: {
        type: String,
        required: true,
        trim: true
    },
    employment_type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        default: 'Full-time'
    },
    experience_required: {
        type: String,
        trim: true
    },
    skills_required: [{
        type: String,
        trim: true
    }],
    salary_range: {
        type: String,
        trim: true
    },
    job_description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    apply_link: {
        type: String,
        trim: true
    },
    source_type: {
        type: String,
        enum: ['Company Site', 'Govt Portal', 'API', 'RSS', 'Startup Board'],
        default: 'Company Site'
    },
    date_posted: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        enum: ['IT', 'Core Engineering', 'Management', 'Healthcare', 'Government', 'Internship'],
        default: 'IT'
    },
    tags: [String],
    is_remote: {
        type: Boolean,
        default: false
    },
    is_fresher_friendly: {
        type: Boolean,
        default: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
