import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, Briefcase } from 'lucide-react';

const Navbar = ({ user, logout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar animate-fade-in">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                Smart <span>Hire</span>
            </Link>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {user ? (
                    <>
                        {user.role === 'employer' ? (
                            <Link to="/employer/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                <LayoutDashboard size={18} /> Employer Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link to="/applications" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                    <Briefcase size={18} /> Tracker
                                </Link>
                                <Link to="/profile" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                    <User size={18} /> Profile
                                </Link>
                            </>
                        )}
                        <button onClick={handleLogout} className="btn btn-primary">
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/employer/auth" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginRight: '10px' }}>Employers</Link>
                        <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
