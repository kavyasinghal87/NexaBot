import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, signup, passwordRecovery } from '../services/appwrite';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useGlobal();
    const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (view === 'login') {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else if (view === 'signup') {
                await signup(formData.email, formData.password, formData.name);
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else if (view === 'forgot') {
                await passwordRecovery(formData.email);
                setMessage("Recovery email sent! Please check your inbox.");
            }
        } catch (err) {
            console.error("Auth Error:", err);

            // Map Appwrite errors to user-friendly messages
            let errorMessage = "Authentication failed. Please check your credentials.";

            if (err.type === 'user_already_exists' || err.code === 409) {
                errorMessage = "An account with this email already exists. Please login instead.";
            } else if (err.type === 'user_password_mismatch' || err.code === 401) {
                errorMessage = "Invalid email or password. Please try again.";
            } else if (err.type === 'password_format_invalid') {
                errorMessage = "Password must be at least 8 characters long.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            // Append debug info to help diagnosis
            if (err.type || err.code) {
                errorMessage += ` (Debug: ${err.type || 'unknown'}, ${err.code || 'N/A'})`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        try {
            // Initiate Appwrite OAuth Login
            account.createOAuth2Session(
                'google',
                `${window.location.origin}/dashboard`,
                `${window.location.origin}/login`
            );
        } catch (error) {
            console.error("Google Auth failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4">

            {/* Header / Logo */}
            <div className="mb-8 text-center">
                <Link to="/" className="inline-flex items-center gap-3 group">
                    <div className="p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-colors ring-1 ring-blue-500/20">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">NexaBot</span>
                </Link>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[420px] bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-white text-center mb-2">
                        {view === 'login' && 'Log in to your Nexa Profile'}
                        {view === 'signup' && 'Create your Nexa Profile'}
                        {view === 'forgot' && 'Reset your Password'}
                    </h2>

                    {view === 'forgot' && (
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Enter your email validation to receive a reset link.
                        </p>
                    )}

                    {view !== 'forgot' && (
                        <>
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium h-11 rounded-lg transition-colors flex items-center justify-center gap-3 mb-6 relative group mt-4 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <span className="relative bg-[#0f172a] px-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">OR</span>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-200 text-sm rounded-lg text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {view === 'signup' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full h-11 bg-gray-900/50 border border-gray-700 rounded-lg px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="w-full h-11 bg-gray-900/50 border border-gray-700 rounded-lg px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans"
                                required
                            />
                        </div>

                        {view !== 'forgot' && (
                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase">Password</label>
                                    {view === 'login' && (
                                        <button type="button" onClick={() => setView('forgot')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full h-11 bg-gray-900/50 border border-gray-700 rounded-lg pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> :
                                view === 'login' ? 'Login' :
                                    view === 'signup' ? 'Sign Up' : 'Send Recovery Link'}
                        </button>

                        {view === 'forgot' && (
                            <button
                                type="button"
                                onClick={() => setView('login')}
                                className="w-full h-11 bg-transparent hover:bg-gray-800 text-gray-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </button>
                        )}
                    </form>
                </div>

                {/* Footer of Card */}
                {view !== 'forgot' && (
                    <div className="p-4 bg-gray-900 border-t border-gray-800 text-center">
                        <p className="text-sm text-gray-400">
                            {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors ml-1 cursor-pointer"
                            >
                                {view === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            {/* Simple footer links under card */}
            <div className="mt-8 flex gap-6 text-sm text-gray-500">
                <button className="hover:text-gray-300 transition-colors cursor-pointer">Privacy Policy</button>
                <button className="hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</button>
                <button className="hover:text-gray-300 transition-colors cursor-pointer">Help Center</button>
            </div>
        </div>
    );
};

export default Login;
