import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ApplicationTracker from './pages/ApplicationTracker';
import EmployerAuth from './pages/EmployerAuth';
import EmployerDashboard from './pages/EmployerDashboard';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <ToastProvider>
      <Router>
        <div className="container">
          <Navbar user={user} logout={logout} />
          <Routes>
            <Route path="/" element={user ? (user.role === 'employer' ? <Navigate to="/employer/dashboard" /> : <Home user={user} />) : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login login={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register login={login} /> : <Navigate to="/" />} />
            <Route path="/employer/auth" element={!user ? <EmployerAuth login={login} /> : <Navigate to="/" />} />
            <Route path="/employer/dashboard" element={user && user.role === 'employer' ? <EmployerDashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/applications" element={user ? <ApplicationTracker /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
