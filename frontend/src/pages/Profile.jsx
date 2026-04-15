import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Mail, Code, Briefcase, Globe, FileText, Upload, CheckCircle, Save, Edit2, Calendar } from 'lucide-react';

const Profile = ({ user, setUser }) => {
    const [isEditing, setIsEditing] = useState(new URLSearchParams(window.location.search).get('edit') === 'true');
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        skills: user.skills?.join(', ') || '',
        projects: user.projects?.join(', ') || '',
        domain: user.domain || '',
        jobCategory: user.jobCategory || 'other',
        yearsExperience: user.yearsExperience || '0'
    });
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(user);

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/profile', {
                headers: { 'x-auth-token': token }
            });
            setProfileData(res.data);
            setFormData({
                fullName: res.data.fullName,
                email: res.data.email,
                phone: res.data.phone,
                skills: res.data.skills?.join(', ') || '',
                projects: res.data.projects?.join(', ') || '',
                domain: res.data.domain || '',
                jobCategory: res.data.jobCategory || 'other',
                yearsExperience: res.data.yearsExperience || '0'
            });
        } catch (err) {
            console.error('Error fetching profile', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (resume) data.append('resume', resume);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5001/api/profile', data, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileData(res.data);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setIsEditing(false);
            window.history.replaceState({}, '', '/profile');
        } catch (err) {
            console.error('Error updating profile', err);
        } finally {
            setLoading(false);
        }
    };

    const DetailItem = ({ icon: Icon, label, value }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <Icon size={20} color="var(--primary)" />
            <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontWeight: '500' }}>{value || 'Not provided'}</p>
            </div>
        </div>
    );

    const getCategoryLabel = (id) => categories.find(c => c.id === id)?.label || id;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Professional Profile</h1>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-outline">
                        <Edit2 size={18} /> Edit Profile
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr' : '1fr 1.5fr', gap: '30px' }}>
                {isEditing ? (
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label>Job Category</label>
                                    <select name="jobCategory" value={formData.jobCategory} onChange={handleChange}>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Experience (Years)</label>
                                    <input type="number" name="yearsExperience" min="0" max="40" value={formData.yearsExperience} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Domain / Job Title</label>
                                <input type="text" name="domain" value={formData.domain} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
                            </div>

                            <div className="input-group">
                                <label>Skills (comma separated)</label>
                                <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python..." rows="3" />
                            </div>

                            <div className="input-group">
                                <label>Key Projects (comma separated)</label>
                                <textarea name="projects" value={formData.projects} onChange={handleChange} placeholder="E-commerce App, Portfolio..." rows="3" />
                            </div>

                            <div className="input-group">
                                <label>Update Resume (Optional PDF)</label>
                                <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>Uploading a new resume will re-calculate your ATS score based on your category and experience.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                margin: '0 auto 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                color: 'white',
                                fontWeight: '700'
                            }}>
                                {profileData.fullName?.[0]}
                            </div>
                            <h2 style={{ marginBottom: '5px' }}>{profileData.fullName}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{getCategoryLabel(profileData.jobCategory)}</p>

                            <div style={{ background: 'var(--glass)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px' }}>ATS SCORE</p>
                                <h3 style={{ fontSize: '2rem', color: profileData.atsScore >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                                    {profileData.atsScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                                </h3>
                            </div>

                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                <a
                                    href={`http://localhost:5001/${profileData.resumeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    <FileText size={18} /> View Resume
                                </a>
                                <button
                                    onClick={() => window.location.href = '/applications'}
                                    className="btn btn-outline"
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    <Briefcase size={18} /> Applications
                                </button>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ marginBottom: '20px' }}>Profile Details</h3>

                            <DetailItem icon={Mail} label="Email Address" value={profileData.email} />
                            <DetailItem icon={Phone} label="Phone Number" value={profileData.phone} />
                            <DetailItem icon={Briefcase} label="Target Role" value={getCategoryLabel(profileData.jobCategory)} />
                            <DetailItem icon={Calendar} label="Experience" value={`${profileData.yearsExperience} Years`} />

                            <div style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Code size={20} color="var(--primary)" />
                                    <h4 style={{ fontSize: '1.1rem' }}>Technical Skills</h4>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {profileData.skills?.length > 0 ? profileData.skills.map((skill, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 14px',
                                            background: 'var(--glass)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {skill}
                                        </span>
                                    )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills added yet.</p>}
                                </div>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Briefcase size={20} color="var(--primary)" />
                                    <h4 style={{ fontSize: '1.1rem' }}>Key Projects</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {profileData.projects?.length > 0 ? profileData.projects.map((project, idx) => (
                                        <div key={idx} style={{
                                            padding: '12px 15px',
                                            background: 'var(--glass)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <CheckCircle size={14} color="var(--success)" /> {project}
                                        </div>
                                    )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects listed.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
