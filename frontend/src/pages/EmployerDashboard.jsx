import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Briefcase, Users, Building, MapPin, Check, X, AlertCircle, BarChart3, PieChart as PieChartIcon, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';

const EmployerDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'post', 'myjobs', 'applications'
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [jobData, setJobData] = useState({
        job_title: '',
        job_location: '',
        employment_type: 'Full-time',
        experience_required: '',
        skills_required: '',
        salary_range: '',
        job_description: '',
        is_remote: false,
        category: 'IT',
        apply_link: ''
    });

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'myjobs') fetchJobs();
        if (activeTab === 'applications') fetchApplications();
    }, [activeTab]);

    useEffect(() => {
        if (user && user.id) {
            const socket = io('http://localhost:5001');
            socket.emit('join', user.id);

            socket.on('newApplication', (newApp) => {
                addToast(`New application received for ${newApp.jobId?.job_title}`, 'success');
                setApplications(prev => [newApp, ...prev]);
                // If they are on the analytics tab, it will need a refresh, or we can just fetch it:
                fetchAnalytics();
            });

            return () => socket.disconnect();
        }
    }, [user, addToast]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/employer/analytics', {
                headers: { 'x-auth-token': token }
            });
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/jobs/my', {
                headers: { 'x-auth-token': token }
            });
            setJobs(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch jobs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/employer/applications', {
                headers: { 'x-auth-token': token }
            });
            setApplications(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/employer/application/${id}`, 
                { status },
                { headers: { 'x-auth-token': token } }
            );
            addToast(`Application marked as ${status}`, 'success');
            fetchApplications();
            fetchAnalytics(); // update analytics in background
        } catch (err) {
            console.error(err);
            addToast('Failed to update status', 'error');
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/jobs/create',
                { ...jobData, company_name: user.companyName },
                { headers: { 'x-auth-token': token } }
            );
            addToast('Job posted successfully!', 'success');
            setActiveTab('myjobs');
        } catch (err) {
            console.error(err);
            addToast('Failed to post job', 'error');
        }
    };

    const handleJobChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setJobData({ ...jobData, [e.target.name]: value });
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>Employer Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{user.companyName} | {user.fullName}</p>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('analytics')}>
                    <BarChart3 size={18} /> Analytics
                </button>
                <button className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('applications')}>
                    <Users size={18} /> Applications
                </button>
                <button className={`btn ${activeTab === 'myjobs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('myjobs')}>
                    <Briefcase size={18} /> My Jobs
                </button>
                <button className={`btn ${activeTab === 'post' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('post')}>
                    <PlusCircle size={18} /> Post a Job
                </button>
            </div>

            {loading && !analytics ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }} className="animate-pulse">Loading...</div>
            ) : (
                <>
                    {activeTab === 'analytics' && analytics && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Analytics Overview</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>Total Applicants</h3>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{analytics.totalApplicants}</span>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '4px solid #4ade80' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', marginBottom: '10px' }}>
                                        <CheckCircle size={16} /> <h3 style={{ fontSize: '0.9rem' }}>Selected</h3>
                                    </div>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{analytics.selectedCount}</span>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '4px solid var(--warning)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '10px' }}>
                                        <Clock size={16} /> <h3 style={{ fontSize: '0.9rem' }}>Interviewing</h3>
                                    </div>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{analytics.interviewCount}</span>
                                </div>
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '4px solid #f87171' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '10px' }}>
                                        <XCircle size={16} /> <h3 style={{ fontSize: '0.9rem' }}>Rejected</h3>
                                    </div>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{analytics.rejectedCount}</span>
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PieChartIcon size={20} /> Pipeline Distribution
                                </h3>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Applied', value: analytics.appliedCount, fill: 'var(--primary)' },
                                                    { name: 'Interviewing', value: analytics.interviewCount, fill: 'var(--warning)' },
                                                    { name: 'Selected', value: analytics.selectedCount, fill: '#4ade80' },
                                                    { name: 'Rejected', value: analytics.rejectedCount, fill: '#f87171' }
                                                ].filter(d => d.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {
                                                    [
                                                        { name: 'Applied', value: analytics.appliedCount, fill: 'var(--primary)' },
                                                        { name: 'Interviewing', value: analytics.interviewCount, fill: 'var(--warning)' },
                                                        { name: 'Selected', value: analytics.selectedCount, fill: '#4ade80' },
                                                        { name: 'Rejected', value: analytics.rejectedCount, fill: '#f87171' }
                                                    ].filter(x => x.value > 0).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))
                                                }
                                            </Pie>
                                            <Tooltip contentStyle={{ background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Recent Applications</h2>
                            {applications.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No applications received yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {applications.map(app => (
                                        <div key={app._id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{app.userId?.fullName || 'Unknown Candidate'}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                    Applied for: <strong style={{ color: 'var(--text-main)' }}>{app.jobId?.job_title || 'Unknown Job'}</strong>
                                                </p>
                                                {app.userId && (
                                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                                                        <span>📧 {app.userId.email}</span>
                                                        <span>📞 {app.userId.phone}</span>
                                                        <span style={{ color: 'var(--primary)' }}>🏆 ATS: {app.userId.atsScore}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                                <div style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    background: app.status === 'Applied' ? 'rgba(99, 102, 241, 0.1)' : 
                                                                app.status === 'Interview' ? 'rgba(234, 179, 8, 0.1)' :
                                                                app.status === 'Selected' || app.status === 'Offer' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: app.status === 'Applied' ? 'var(--primary)' : 
                                                           app.status === 'Interview' ? 'var(--warning)' :
                                                           app.status === 'Selected' || app.status === 'Offer' ? '#4ade80' : '#f87171'
                                                }}>
                                                    {app.status}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {app.status === 'Applied' && (
                                                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => updateApplicationStatus(app._id, 'Interview')}>
                                                            Interview
                                                        </button>
                                                    )}
                                                    {(app.status === 'Applied' || app.status === 'Interview') && (
                                                        <>
                                                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderColor: '#4ade80' }} onClick={() => updateApplicationStatus(app._id, 'Offer')}>
                                                                <Check size={14} /> Accept
                                                            </button>
                                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.5)' }} onClick={() => updateApplicationStatus(app._id, 'Rejected')}>
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'myjobs' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Posted Jobs</h2>
                            {jobs.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {jobs.map(job => (
                                        <div key={job._id} className="glass-card" style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{job.job_title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                                                <MapPin size={14} /> {job.job_location} {job.is_remote ? '(Remote)' : ''}
                                            </div>
                                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                {job.category}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'post' && (
                        <div className="glass-card" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Create New Job Posting</h2>
                            <form onSubmit={handleJobSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="input-group">
                                        <label>Job Title</label>
                                        <input type="text" name="job_title" required value={jobData.job_title} onChange={handleJobChange} />
                                    </div>
                                    <div className="input-group">
                                        <label>Category</label>
                                        <select name="category" value={jobData.category} onChange={handleJobChange}>
                                            <option value="IT">IT</option>
                                            <option value="Core Engineering">Core Engineering</option>
                                            <option value="Management">Management</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Government">Government</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Location</label>
                                        <input type="text" name="job_location" required value={jobData.job_location} onChange={handleJobChange} placeholder="e.g. New York, NY" />
                                    </div>
                                    <div className="input-group">
                                        <label>Employment Type</label>
                                        <select name="employment_type" value={jobData.employment_type} onChange={handleJobChange}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Experience Required</label>
                                        <input type="text" name="experience_required" value={jobData.experience_required} onChange={handleJobChange} placeholder="e.g. 2-4 years" />
                                    </div>
                                    <div className="input-group">
                                        <label>Salary Range</label>
                                        <input type="text" name="salary_range" value={jobData.salary_range} onChange={handleJobChange} placeholder="e.g. $80k - $120k" />
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label>Skills Required (comma separated)</label>
                                    <input type="text" name="skills_required" required value={jobData.skills_required} onChange={handleJobChange} placeholder="React, Node.js, MongoDB" />
                                </div>

                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label>Job Description</label>
                                    <textarea name="job_description" required rows="5" value={jobData.job_description} onChange={handleJobChange} placeholder="Describe the responsibilities and requirements..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }}></textarea>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                                    <input type="checkbox" name="is_remote" id="is_remote" checked={jobData.is_remote} onChange={handleJobChange} style={{ width: 'auto' }} />
                                    <label htmlFor="is_remote" style={{ marginBottom: 0 }}>This is a remote position</label>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <PlusCircle size={18} /> Publish Job
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EmployerDashboard;
