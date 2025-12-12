import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md perspective-1000"
            >
                <GlassCard className="w-full relative overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl bg-white/5">

                    <div className="relative z-10 p-2">
                        <div className="text-center mb-8">
                            <motion.h2
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-extrabold tracking-tight text-white mb-2"
                            >
                                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Back</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/50 text-sm"
                            >
                                Sign in to continue your journey
                            </motion.p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg mb-6 text-center backdrop-blur-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="relative group"
                            >
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors duration-300" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="relative group"
                            >
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors duration-300" />
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-purple-500/20"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Sign In <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center mt-8"
                        >
                            <p className="text-sm text-white/40">
                                Don't have an account? <Link to="/register" className="text-white hover:text-white/80 font-medium underline decoration-white/30 underline-offset-4 hover:decoration-white/80 transition-all">Create Account</Link>
                            </p>
                        </motion.div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
