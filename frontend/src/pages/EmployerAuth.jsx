import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Mail, Lock, Phone, User, LogIn, UserPlus } from 'lucide-react';

const EmployerAuth = ({ login }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/employer/login' : '/api/employer/register';
            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : formData;

            const res = await axios.post(`http://localhost:5001${endpoint}`, payload);
            
            login(res.data.user, res.data.token);
            navigate('/employer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '60px auto' }} className="animate-fade-in">
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '50%', color: 'var(--primary)' }}>
                        <Building size={32} />
                    </div>
                </div>
                <h2 style={{ marginBottom: '5px', textAlign: 'center', fontSize: '1.8rem', fontWeight: '800' }}>
                    {isLogin ? 'Employer Login' : 'Employer Registration'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    {isLogin ? 'Access your employer dashboard' : 'Create an account to post jobs'}
                </p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <label>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" name="fullName" placeholder="John Doe" style={{ paddingLeft: '40px' }} value={formData.fullName} onChange={handleChange} required={!isLogin} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Company Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" name="companyName" placeholder="Acme Corp" style={{ paddingLeft: '40px' }} value={formData.companyName} onChange={handleChange} required={!isLogin} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" name="phone" placeholder="+1 (555) 000-0000" style={{ paddingLeft: '40px' }} value={formData.phone} onChange={handleChange} required={!isLogin} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" name="email" placeholder="name@company.com" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" name="password" placeholder="••••••••" style={{ paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={loading}>
                        {loading ? 'Processing...' : (
                            isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Register</>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: '25px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isLogin ? "Don't have an employer account? " : "Already have an account? "}
                    <span 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </span>
                </p>
                <p style={{ marginTop: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Looking for a job? <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Candidate Login</Link>
                </p>
            </div>
        </div>
    );
};

export default EmployerAuth;
