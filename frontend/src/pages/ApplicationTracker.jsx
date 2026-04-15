import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Briefcase, Calendar, ExternalLink, MoreVertical, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';

const ApplicationTracker = () => {
    const [applications, setApplications] = useState([]);
    const [analytics, setAnalytics] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const { addToast } = useToast();

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/applications', {
                headers: { 'x-auth-token': token }
            });
            setApplications(res.data.applications);
            setAnalytics(res.data.analytics);
            setLoading(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch applications', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();

        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.id) {
                const socket = io('http://localhost:5001');
                socket.emit('join', user.id);

                socket.on('statusUpdate', (data) => {
                    addToast(`Update: ${data.jobTitle} status changed to ${data.status}`, 'success');
                    setApplications(prev => prev.map(app => 
                        app._id === data.applicationId ? { ...app, status: data.status } : app
                    ));
                });

                return () => socket.disconnect();
            }
        }
    }, [addToast]);

    const handleStatusChange = async (appId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/applications/${appId}`,
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            addToast(`Status updated to ${newStatus}`, 'success');
            fetchApplications(); // Refresh data
        } catch (err) {
            console.error(err);
            addToast('Failed to update status', 'error');
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.jobId.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobId.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading">Loading Tracker...</div>;

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
                <p className="text-muted">Manage your professional journey and track your progress.</p>
            </header>

            <div className="analytics-grid">
                <div className="stat-card glass-card">
                    <div className="stat-value">{analytics.total}</div>
                    <div className="stat-label">Total Applied</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: '#fbbf24' }}>{analytics.interview}</div>
                    <div className="stat-label">Interviews</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: '#4ade80' }}>{analytics.offer}</div>
                    <div className="stat-label">Offers</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: '#f87171' }}>{analytics.rejected}</div>
                    <div className="stat-label">Rejections</div>
                </div>
            </div>

            <div className="tracker-header">
                <div className="filters">
                    <div className="input-group mb-0" style={{ width: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search jobs or companies..."
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <select
                        className="status-select"
                        style={{ height: '46px', padding: '0 16px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Job Details</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map((app) => (
                                <tr key={app._id} className="animate-fade-in">
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{app.jobId.job_title}</span>
                                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>{app.jobId.company_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select status-${app.status.toLowerCase()}`}
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <Calendar size={14} />
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <a
                                            href={app.jobId.apply_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        >
                                            Portal <ExternalLink size={14} />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationTracker;
