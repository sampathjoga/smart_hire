import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, Phone, FileText, User, Briefcase, Calendar } from 'lucide-react';

const Register = ({ login }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        jobCategory: 'other',
        yearsExperience: '0'
    });
    const [resume, setResume] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [atsResult, setAtsResult] = useState(null);
    const navigate = useNavigate();

    const categories = [
        { id: 'frontend', label: 'Frontend Developer' },
        { id: 'backend', label: 'Backend Developer' },
        { id: 'fullstack', label: 'Fullstack Developer' },
        { id: 'data-science', label: 'Data Science' },
        { id: 'data-analytics', label: 'Data Analytics' },
        { id: 'devops', label: 'DevOps' },
        { id: 'mobile', label: 'Mobile Developer' },
        { id: 'product', label: 'Product Management' },
        { id: 'qa', label: 'QA / Testing' },
        { id: 'security', label: 'Cyber Security' },
        { id: 'ui-ux', label: 'UI/UX Designer' },
        { id: 'other', label: 'Other' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^\d{10}$/.test(formData.phone)) {
            setError('Mobile number must be exactly 10 digits');
            return;
        }

        if (!resume) {
            setError('Please upload your resume PDF');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', formData.phone);
        data.append('jobCategory', formData.jobCategory);
        data.append('yearsExperience', formData.yearsExperience);
        data.append('resume', resume);

        try {
            const res = await axios.post('http://localhost:5001/api/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAtsResult({
                score: res.data.user.atsScore,
                message: res.data.message
            });

            setTimeout(() => {
                login(res.data.user, res.data.token);
                navigate('/');
            }, 4000);

        } catch (err) {
            if (err.response?.data?.atsScore !== undefined) {
                setAtsResult({
                    score: err.response.data.atsScore,
                    breakdown: err.response.data.breakdown,
                    message: err.response.data.message,
                    suggestion: err.response.data.suggestion,
                    failed: true
                });
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
            setLoading(false);
        }
    };

    if (atsResult) {
        return (
            <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }} className="animate-fade-in">
                <div className="glass-card" style={{ padding: '40px' }}>
                    <h2 style={{ marginBottom: '10px' }}>
                        {atsResult.failed ? 'Registration Failed' : 'Registration Successful'}
                    </h2>

                    <div style={{ fontSize: '4.5rem', fontWeight: '800', margin: '15px 0', color: !atsResult.failed ? 'var(--success)' : 'var(--danger)' }}>
                        {atsResult.score}
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.9rem' }}>Resume ATS Score</p>

                    {atsResult.breakdown && (
                        <div style={{ textAlign: 'left', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {[
                                { label: 'Role Match', value: atsResult.breakdown.roleMatch, color: 'var(--primary)' },
                                { label: 'Experience Fit', value: atsResult.breakdown.experienceFit, color: 'var(--secondary)' },
                                { label: 'Layout Quality', value: atsResult.breakdown.layoutScore, color: 'var(--success)' },
                                { label: 'Impact Level', value: atsResult.breakdown.impactScore, color: 'var(--warning)' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item.value}%</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${item.value}%`, background: item.color, transition: 'width 1s ease-out' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        background: !atsResult.failed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: !atsResult.failed ? 'var(--success)' : 'var(--danger)',
                        marginBottom: '25px',
                        border: `1px solid ${!atsResult.failed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{atsResult.message}</div>
                        {atsResult.suggestion && (
                            <div style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.9 }}>
                                💡 {atsResult.suggestion}
                            </div>
                        )}
                    </div>

                    {!atsResult.failed ? (
                        <div className="animate-pulse" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Redirecting to dashboard in a moment...
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onClick={() => setAtsResult(null)}
                        >
                            <UserPlus size={18} /> Try Again with Improved Resume
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto' }} className="animate-fade-in">
            <div className="glass-card" style={{ padding: '40px' }}>
                <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Create Account</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" name="fullName" placeholder="John Doe" style={{ paddingLeft: '40px' }} value={formData.fullName} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="tel" name="phone" placeholder="1234567890" pattern="\d{10}" title="Mobile number must be exactly 10 digits" style={{ paddingLeft: '40px' }} value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" name="email" placeholder="name@example.com" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" name="password" placeholder="••••••••" style={{ paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Job Category</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select name="jobCategory" style={{ paddingLeft: '40px' }} value={formData.jobCategory} onChange={handleChange}>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Experience (Years)</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="number" name="yearsExperience" min="0" max="40" style={{ paddingLeft: '40px' }} value={formData.yearsExperience} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Resume (PDF only)</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="file" name="resume" accept=".pdf" style={{ paddingLeft: '40px' }} onChange={handleFileChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Processing Resume...' : <><UserPlus size={18} /> Register</>}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
