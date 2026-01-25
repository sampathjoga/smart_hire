import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Search, Upload, Briefcase, MapPin, DollarSign, LogOut, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null); // { summary, score, skills }
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'analyze'
    const [selectedJob, setSelectedJob] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = e.target.search.value;
        if (!query) return;

        setLoading(true);
        setJobs([]);
        try {
            const res = await fetch(`/jobs?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data.jobs)) {
                setJobs(data.jobs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        const file = e.target.resume.files[0];
        if (!file) return;

        setLoading(true);
        const fd = new FormData();
        fd.append("resume", file);

        try {
            const res = await fetch('/analyze-resume', {
                method: 'POST',
                // Verification optional for now, backend public endpoint
                body: fd,
            });
            const data = await res.json();

            if (data.parsed) {
                setAnalysis(data.parsed);
            }
            if (Array.isArray(data.recommendedJobs)) {
                setJobs(data.recommendedJobs);
            }
        } catch (err) {
            console.error("Analysis failed", err);
            alert("Analysis failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
    };

    const confirmApplication = () => {
        alert(`Application submitted for ${selectedJob.title} at ${selectedJob.company}!`);
        setSelectedJob(null);
    };

    // Safe header container
    const Header = () => (
        <nav className="flex justify-between items-center py-6 mb-8">
            <h1 className="text-2xl font-bold text-white">
                SmartHire
            </h1>
            <button onClick={handleLogout} className="text-white/60 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </nav>
    );

    return (
        <div className="container mx-auto px-4 pb-20 max-w-5xl relative">
            <Header />

            {/* Hero Section */}
            <section className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Find your <span className="text-white border-b-2 border-white/30">dream job</span> with AI
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    Analyze your resume to find the perfect match or search manually through our extensive database.
                </p>
            </section>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`px-6 py-2 rounded-full transition-all ${activeTab === 'search' ? 'bg-white text-black shadow-lg hover:bg-white/90' : 'text-white/40 hover:text-white/80'}`}
                >
                    Job Search
                </button>
                <button
                    onClick={() => setActiveTab('analyze')}
                    className={`px-6 py-2 rounded-full transition-all ${activeTab === 'analyze' ? 'bg-white text-black shadow-lg hover:bg-white/90' : 'text-white/40 hover:text-white/80'}`}
                >
                    AI Resume Check
                </button>
            </div>

            {/* Search / Analyze Forms */}
            <GlassCard className="mb-12">
                {activeTab === 'search' ? (
                    <form onSubmit={handleSearch} className="flex gap-4 flex-col md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
                            <input
                                name="search"
                                type="text"
                                placeholder="Job title, keywords, or company..."
                                className="input-glass pl-12 h-12 text-lg"
                            />
                        </div>
                        <Button type="submit" isLoading={loading} className="md:w-32">
                            Find Jobs
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <form onSubmit={handleAnalyze} className="flex gap-4 flex-col md:flex-row items-center">
                            <div className="flex-1 w-full">
                                <input required name="resume" type="file" id="dash-resume" className="hidden" accept=".pdf,.docx" />
                                <label htmlFor="dash-resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                                    <span className="text-white/60 text-sm">Click to upload Resume (PDF)</span>
                                </label>
                            </div>
                            <Button type="submit" isLoading={loading} className="md:w-32 self-stretch md:self-center">
                                Analyze
                            </Button>
                        </form>

                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-t border-white/10 pt-6 mt-6"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl font-bold text-white">{analysis.score}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">ATS Match Score</h3>
                                        <p className="text-white/50 text-sm">Based on market standards</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-white/80 text-sm uppercase font-semibold mb-2">Key Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.skills?.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white border border-white/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 text-sm uppercase font-semibold mb-2">Quick Summary</h4>
                                        <p className="text-white/70 text-sm leading-relaxed">{analysis.summary}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </GlassCard>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {jobs.map((job, idx) => (
                        <GlassCard key={idx} delay={idx * 0.05} className="flex flex-col h-full hover:border-white/30 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold text-white uppercase">
                                    {(job.company || "C")[0]}
                                </div>
                                <span className="px-2 py-1 bg-white/10 text-white text-xs rounded border border-white/20">
                                    {job.type || "Full-time"}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/80 transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center text-white/50 text-sm mb-4">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {job.company}
                            </div>

                            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/5">
                                <div className="flex items-center text-white/60 text-xs">
                                    <MapPin className="w-3 h-3 mr-1.5" />
                                    {job.location || "Remote"}
                                </div>
                                <div className="flex items-center text-white/60 text-xs">
                                    <DollarSign className="w-3 h-3 mr-1.5" />
                                    {job.salaryRange || "Competitive"}
                                </div>
                            </div>

                            <Button onClick={() => handleApplyClick(job)} className="w-full mt-4 text-sm py-2">
                                Apply Now
                            </Button>
                        </GlassCard>
                    ))}
                </AnimatePresence>
            </div>

            {!loading && jobs.length === 0 && (
                <div className="text-center text-white/30 py-12">
                    <p>Ready to start? Search for jobs or analyze your resume above.</p>
                </div>
            )}

            {/* Job Details Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <GlassCard className="relative border border-white/20 shadow-2xl bg-[#0f0c19]"> {/* Solid-ish bg for readability */}
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl font-bold text-white uppercase mb-4">
                                        {(selectedJob.company || "C")[0]}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedJob.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {selectedJob.company}</span>
                                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {selectedJob.location}</span>
                                        <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1.5" /> {selectedJob.salaryRange}</span>
                                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white border border-white/20">{selectedJob.type}</span>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Job Description</h3>
                                        <p className="text-white/70 leading-relaxed">
                                            {selectedJob.description || "No specific description provided for this role. Join our team to make an impact!"}
                                        </p>
                                    </div>

                                    {/* Mock Requirements Section since we don't have it in DB yet, dynamic placeholder */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
                                        <ul className="list-disc list-inside text-white/70 space-y-1">
                                            <li>Experience with modern web technologies.</li>
                                            <li>Strong problem-solving skills.</li>
                                            <li>Excellent communication and teamwork abilities.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button onClick={() => setSelectedJob(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                                        Cancel
                                    </Button>
                                    <Button onClick={confirmApplication} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                                        Confirm Application
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
