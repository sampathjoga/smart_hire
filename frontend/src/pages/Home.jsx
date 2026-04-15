import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Award, AlertCircle, ArrowRight, User, FileText, Briefcase, MapPin, ExternalLink, Search, Filter, X } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const Home = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchCategories();
        fetchJobs();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/jobs/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/jobs', {
                params: {
                    category: selectedCategory,
                    search: searchQuery
                }
            });
            setJobs(res.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleApply = async (e, job) => {
        e.stopPropagation(); // Prevent opening modal if clicking button on card

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5001/api/applications/apply/${job._id}`,
                {},
                { headers: { 'x-auth-token': token } }
            );

            addToast(`Applied to ${job.company_name} successfully!`, 'success');

            // Open company portal in new tab
            window.open(job.apply_link, '_blank');

        } catch (err) {
            if (err.response && err.response.data.message === 'Already applied for this job') {
                addToast('You have already applied for this job', 'warning');
                window.open(job.apply_link, '_blank'); // Still let them go to the portal
            } else {
                console.error(err);
                addToast('Failed to record application', 'error');
            }
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.fullName}</span></p>
            </header>

            {/* Stats and Quick Actions omitted for brevity, keeping existing code... */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start', marginBottom: '60px' }}>
                <div className="glass-card" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <Award size={28} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Your ATS Performance</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1 }}>{user.atsScore}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>/ 100</span>
                    </div>

                    <div className={`score-badge ${getScoreClass(user.atsScore)}`} style={{ display: 'inline-block', marginBottom: '20px', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
                        {user.atsScore >= 70 ? 'Optimal Score' : 'Action Required'}
                    </div>

                    {user.atsScore < 70 ? (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '15px',
                            color: '#f87171'
                        }}>
                            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <h4 style={{ marginBottom: '5px', fontSize: '0.95rem' }}>Low ATS Score</h4>
                                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.5' }}>
                                    Your resume is missing key industry terms. Update your skills to increase visibility to recruiters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '15px',
                            color: '#4ade80'
                        }}>
                            <Award size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <h4 style={{ marginBottom: '5px', fontSize: '0.95rem' }}>Great Profile!</h4>
                                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.5' }}>
                                    Your resume score is excellent. You are well-positioned for the jobs listed below.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h4 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Quick Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/profile" className="btn btn-outline" style={{ justifyContent: 'space-between', textDecoration: 'none', padding: '12px 20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}><User size={16} /> View Profile</span>
                                <ArrowRight size={14} />
                            </Link>
                            <Link to="/profile?edit=true" className="btn btn-outline" style={{ justifyContent: 'space-between', textDecoration: 'none', padding: '12px 20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}><FileText size={16} /> Update Resume</span>
                                <ArrowRight size={14} />
                            </Link>
                            <Link to="/applications" className="btn btn-outline" style={{ justifyContent: 'space-between', textDecoration: 'none', padding: '12px 20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}><Briefcase size={16} /> My Applications</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '25px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(192, 132, 252, 0.05))' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Pro Tip</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            "Action verbs like 'Directed', 'Orchestrated', and 'Optimized' significantly improve how ATS systems rank your leadership experience."
                        </p>
                    </div>
                </div>
            </div>

            {/* Job Board Section */}
            <section style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Recommended Jobs</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <form onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    style={{ padding: '8px 12px 8px 35px', fontSize: '0.9rem', width: '200px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                        </div>
                        <select
                            style={{ padding: '8px 12px', fontSize: '0.9rem', width: '150px' }}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading live opportunities...</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {jobs.length > 0 ? jobs.map((job) => (
                            <div
                                key={job._id}
                                className="glass-card animate-fade-in"
                                style={{
                                    padding: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onClick={() => setSelectedJob(job)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--primary)'
                                    }}>
                                        {job.category}
                                    </div>
                                    {job.is_remote && (
                                        <div style={{
                                            padding: '4px 10px',
                                            background: 'rgba(74, 222, 128, 0.1)',
                                            color: '#4ade80',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem'
                                        }}>Remote</div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: '700' }}>{job.job_title}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '15px' }}>{job.company_name}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', flexGrow: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <MapPin size={14} /> {job.job_location}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Briefcase size={14} /> {job.employment_type} • {job.experience_required}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                                    {job.skills_required.slice(0, 3).map((skill, i) => (
                                        <span key={i} style={{
                                            fontSize: '0.7rem',
                                            padding: '4px 10px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '4px',
                                            color: 'var(--text-muted)'
                                        }}>{skill}</span>
                                    ))}
                                </div>

                                <button
                                    className="btn btn-outline"
                                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Avoid opening modal
                                        setSelectedJob(job); // Open modal anyway for now, or direct apply? Strategy says apply is on detailed view usually, but let's keep it here too?
                                        // Actually let's just View Details as originally labelled, or Apply?
                                        // Original was View Details. Let's keep View Details behavior on card click, but maybe add Apply button?
                                        // The user request says: "When you click "Apply Now" on any job...". 
                                        // I'll assume the button in the modal is the primary "Apply Now".
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                No jobs found for the selected category.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Detailed Job Modal */}
            {selectedJob && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setSelectedJob(null)}>
                    <div className="glass-card" style={{
                        maxWidth: '700px',
                        width: '100%',
                        padding: '40px',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedJob(null)}
                            style={{
                                position: 'absolute',
                                right: '25px',
                                top: '25px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ marginBottom: '30px', paddingRight: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                    {selectedJob.category}
                                </span>
                                {selectedJob.is_remote && (
                                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                        Remote
                                    </span>
                                )}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: '800', lineHeight: 1.2 }}>{selectedJob.job_title}</h2>
                            <p style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '600' }}>{selectedJob.company_name}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Location</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>{selectedJob.job_location}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                    <Briefcase size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Type</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>{selectedJob.employment_type}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                    <Award size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Salary</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>{selectedJob.salary_range || 'Competitive'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Experience</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>{selectedJob.experience_required}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '1.2rem', fontWeight: '700' }}>Job Description</h4>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                                {selectedJob.job_description}
                            </p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '1.2rem', fontWeight: '700' }}>Key Skills</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {selectedJob.skills_required.map((skill, i) => (
                                    <span key={i} style={{
                                        padding: '8px 18px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-main)',
                                        fontWeight: '500'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', position: 'sticky', bottom: '-40px', background: 'rgba(20, 20, 25, 0.9)', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                            <button
                                onClick={(e) => handleApply(e, selectedJob)}
                                className="btn btn-primary"
                                style={{ flex: 2, justifyContent: 'center', gap: '12px', textDecoration: 'none', height: '55px', fontSize: '1.1rem', fontWeight: '700' }}
                            >
                                Apply Now <ExternalLink size={20} />
                            </button>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="btn btn-outline"
                                style={{ flex: 1, height: '55px', fontWeight: '600' }}
                            >
                                Back to Board
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
