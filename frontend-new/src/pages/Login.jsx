import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Mail, Lock } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm relative overflow-hidden" delay={0.2}>
                <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>

                <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200">
                    Welcome Back
                </h2>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg mb-4 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                        <input required name="email" type="email" placeholder="Email" className="input-glass pl-10" />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                        <input required name="password" type="password" placeholder="Password" className="input-glass pl-10" />
                    </div>

                    <Button type="submit" className="w-full mt-4" isLoading={loading}>
                        Sign In
                    </Button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-white/50">
                        Don't have an account? <Link to="/register" className="text-pink-300 hover:text-pink-200 underline decoration-pink-500/30 underline-offset-4">Register</Link>
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;
