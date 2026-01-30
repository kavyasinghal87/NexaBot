import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { completePasswordRecovery } from '../services/appwrite';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState('');
    const [secret, setSecret] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const uid = params.get('userId');
        const sec = params.get('secret');

        if (uid) setUserId(uid);
        if (sec) setSecret(sec);

        if (!uid || !sec) {
            setError("Invalid recovery link. Please request a new one.");
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await completePasswordRecovery(userId, secret, password, confirmPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error("Reset Error:", err);
            setError(err.message || "Failed to reset password. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-400 mb-6">Your password has been updated. Redirecting to login...</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 mb-4 ring-1 ring-blue-500/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                        <p className="text-gray-400 text-sm mt-2">Enter your new secure password</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 focus:border-blue-500 rounded-lg py-2.5 pl-10 pr-10 text-gray-200 placeholder-gray-600 outline-none transition-all"
                                    placeholder="••••••••"
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 focus:border-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-gray-200 placeholder-gray-600 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !userId || !secret}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Set New Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
