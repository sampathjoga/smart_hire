import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Upload, User, Mail, Lock, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [atsScore, setAtsScore] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const phone = formData.get('phone');

        try {
            // 1. Supabase Signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone
                    }
                }
            });

            if (authError) throw authError;

            // 2. ATS Analysis (backend)
            // Only proceed if resume is provided, otherwise just navigate
            if (file) {
                const res = await fetch('/register', {
                    method: 'POST',
                    body: formData, // Contains 'resume'
                });

                const data = await res.json();

                if (!res.ok) {
                    // Start soft error, maybe just alert but don't block registration success
                    console.error("ATS Analysis failed:", data.error);
                } else if (data.atsScore) {
                    setAtsScore(data.atsScore);
                    // Show success and redirect after short delay
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                    return; // Return early to show score
                }
            }

            // If no file or analysis done, standard redirect
            if (!atsScore) {
                alert('Registration successful! Please check your email for verification.');
                navigate('/login');
            }

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md relative overflow-hidden">
                {/* Clean B&W Background - Removed colored blobs */}

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">
                        Create Account
                    </h2>
                    <p className="text-center text-white/60 mb-8 text-sm">Join SmartHire and analyze your potential</p>

                    {atsScore !== null ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                                {atsScore}
                            </div>
                            <h3 className="text-xl font-semibold text-white">Registration Successful!</h3>
                            <p className="text-white/70 mt-2">Your ATS Score</p>
                            <p className="text-xs text-white/50 mt-4">Redirecting to login...</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                <input required name="name" type="text" placeholder="Full Name" className="input-glass pl-10" />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                <input required name="email" type="email" placeholder="Email Address" className="input-glass pl-10" />
                            </div>

                            <div className="relative group">
                                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                <input name="phone" type="tel" placeholder="Phone Number" className="input-glass pl-10" />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                <input required name="password" type="password" placeholder="Password" className="input-glass pl-10" />
                            </div>

                            <div className="relative group">
                                <input
                                    required
                                    name="resume"
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className={`input-glass flex items-center gap-3 cursor-pointer hover:bg-white/10 ${file ? 'text-white border-white/30' : 'text-white/60'}`}
                                >
                                    <Upload className="w-5 h-5" />
                                    <span className="truncate">{file ? file.name : "Upload Resume (PDF/DOCX)"}</span>
                                </label>
                            </div>

                            <Button type="submit" className="w-full mt-6" isLoading={loading}>
                                Register & Analyze
                            </Button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-white/50">
                                    Already have an account? <Link to="/login" className="text-white hover:text-white/80 underline decoration-white/30 underline-offset-4">Log in</Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default Register;
