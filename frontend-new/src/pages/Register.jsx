import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Upload, User, Mail, Lock, Phone, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
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
            if (file) {
                const res = await fetch('/register', {
                    method: 'POST',
                    body: formData, // Contains 'resume'
                });

                const data = await res.json();

                if (!res.ok) {
                    console.error("ATS Analysis failed:", data.error);
                } else if (data.atsScore) {
                    setAtsScore(data.atsScore);
                    setTimeout(() => {
                        navigate('/login');
                    }, 2500);
                    return;
                }
            }

            if (!atsScore) {
                // If no analysis needed or just manual
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
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-10 w-full max-w-lg perspective-1000"
            >
                <GlassCard className="w-full relative overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl bg-white/5">

                    <div className="relative z-10 p-2">
                        <div className="text-center mb-8">
                            <motion.h2
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-extrabold tracking-tight text-white mb-2"
                            >
                                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Account</span>
                            </motion.h2>
                            <p className="text-white/50 text-sm">Join SmartHire and inspect your resume</p>
                        </div>

                        {atsScore !== null ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                    <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-emerald-400/30">
                                        {atsScore}
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Registration Complete!</h3>
                                <p className="text-emerald-300 font-medium">Your Initial ATS Score</p>
                                <p className="text-white/40 text-sm mt-8 animate-pulse">Redirecting you to login...</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                        <input required name="name" type="text" placeholder="Full Name" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                    </motion.div>

                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                        <input name="phone" type="tel" placeholder="Phone" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                    </motion.div>
                                </div>

                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                    <input required name="email" type="email" placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </motion.div>

                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                    <input required name="password" type="password" placeholder="Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                    <input required name="resume" type="file" id="resume-upload" className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileChange} />
                                    <label htmlFor="resume-upload" className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${file ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                                        <Upload className={`w-8 h-8 mb-2 ${file ? 'text-emerald-400' : 'text-white/40'}`} />
                                        <span className={`text-sm font-medium ${file ? 'text-emerald-300' : 'text-white/60'}`}>{file ? file.name : "Upload Resume (PDF/DOCX)"}</span>
                                    </label>
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                    <Button type="submit" className="w-full py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-lg shadow-emerald-500/20" disabled={loading}>
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Analyze & Register</span>
                                        ) : ("Create Account")}
                                    </Button>
                                </motion.div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center mt-6">
                                    <Link to="/login" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                                    </Link>
                                </motion.div>
                            </form>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
