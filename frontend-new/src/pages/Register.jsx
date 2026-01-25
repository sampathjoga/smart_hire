import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseResumeToText, calculateATSScore } from '../utils/atsScore';


const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [showScoreModal, setShowScoreModal] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const phone = formData.get('phone');
        const resumeFile = formData.get('resume');

        try {
            // --- Client-Side ATS Validation ---
            if (resumeFile && resumeFile.size > 0) {
                setLoading(true); // Ensure loading state
                try {
                    const text = await parseResumeToText(resumeFile);
                    const { atsScore } = calculateATSScore(text);

                    if (atsScore <= 60) {
                        alert(`Registration Failed: Your Resume ATS Score is ${atsScore}/100. Minimum required is > 60.`);
                        setLoading(false);
                        return; // BLOCK REGISTRATION
                    }

                    // Optional: Append score to form data if backend wants to trust client (or just for logging)
                    // formData.append('clientAtsScore', atsScore);
                    console.log(`Client-side ATS Check Passed: Score ${atsScore}`);

                } catch (parseError) {
                    console.error("Resume parsing error:", parseError);
                    alert("Could not analyze resume. Please ensure it is a valid PDF or DOCX.");
                    setLoading(false);
                    return;
                }
            }
            // ----------------------------------

            // NOTE: We send `formData` directly (multipart/form-data) to handle file upload
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData, // Send the FormData object directly
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                // If backend returns plain text error (which caused the "Unexpected token" issue)
                throw new Error(text || 'Server error (Invalid JSON Response)');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success - Show Score UI
            setRegistrationData(data.user);
            setShowScoreModal(true);
            // navigate('/login'); // Moving navigation to Modal Close

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            {/* Score Modal */}
            {showScoreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
                    >
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mb-6 bg-emerald-500/10">
                            <span className="text-4xl font-bold text-emerald-400">{registrationData?.score || 0}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                        <p className="text-white/60 mb-6">Your resume has passed the ATS check.</p>
                        <p className="text-sm text-white/40 mb-8">Role: {registrationData?.role || 'Seeker'}</p>

                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                        >
                            Continue to Login
                        </Button>
                    </motion.div>
                </div>
            )}

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
                            <p className="text-white/50 text-sm">Join SmartHire today</p>
                        </div>

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

                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative group">
                                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    required
                                    name="resume"
                                    type="file"
                                    accept=".pdf"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                                />
                                <p className="text-xs text-white/40 mt-1 ml-4">Upload Resume (PDF only) - ATS Scan Required (&gt;70)</p>
                            </motion.div>

                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <Button type="submit" className="w-full py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-lg shadow-emerald-500/20" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</span>
                                    ) : ("Create Account")}
                                </Button>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center mt-6">
                                <Link to="/login" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                                </Link>
                            </motion.div>
                        </form>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
