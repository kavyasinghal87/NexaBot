import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { account, ensureSession } from '../services/appwrite';
import { Calendar, AlertTriangle, FileCode, Search, Inbox, ArrowRight, Trash2 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchHistory = async () => {
        let currentUserId = 'app-user';
        const user = await ensureSession();
        if (user) {
            currentUserId = user.$id;
        }

        setUserId(currentUserId);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/history/${currentUserId}`);
            if (Array.isArray(response.data)) {
                setHistory(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
                setHistory([]);
            }
        } catch (err) {
            console.error("Failed to load audits", err);
            // Ensure history remains an array on error
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDeleteHistory = async () => {
        if (!userId) return;

        // Optimistic update: Clear UI immediately
        const previousHistory = [...history];
        setHistory([]);
        setIsDeleteModalOpen(false);

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/history/${userId}`);
        } catch (err) {
            console.error("Failed to delete history", err);
            // Revert on error if necessary, but for now we'll just log it
            // setHistory(previousHistory); 
            if (err.response && err.response.data) {
                console.error("Backend Error Details:", err.response.data);
            }
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="h-8 w-48 bg-gray-800 rounded-lg animate-pulse mb-3"></div>
                        <div className="h-4 w-64 bg-gray-800/50 rounded animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 h-[280px] flex flex-col animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-6 w-24 bg-gray-800 rounded-full"></div>
                                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="h-4 w-32 bg-gray-800 rounded"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-800/50 rounded"></div>
                                    <div className="h-3 w-full bg-gray-800/50 rounded"></div>
                                    <div className="h-3 w-2/3 bg-gray-800/50 rounded"></div>
                                </div>
                            </div>
                            <div className="h-10 w-full bg-gray-800 rounded-lg mt-4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Audit History</h1>
                    <p className="text-gray-400">Review your past code security analysis sessions.</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center gap-2 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete History
                    </button>
                )}
            </header>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1e1e1e] rounded-2xl border border-gray-800 border-dashed animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No history yet</h3>
                    <p className="text-gray-500 max-w-md text-center">
                        Your audit logs will appear here once you run your first analysis on the Dashboard.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((audit) => (
                        <div key={audit.$id} className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all group shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${audit.riskLevel === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    audit.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-green-500/10 text-green-400 border border-green-500/20'
                                    }`}>
                                    <AlertTriangle className="w-3 h-3" />
                                    {audit.riskLevel} Risk
                                </div>
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(audit.$createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="text-gray-500 text-xs uppercase font-semibold mb-2 flex items-center gap-1">
                                    <FileCode className="w-3 h-3" /> Analysis Snippet
                                </div>
                                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                                    {JSON.parse(JSON.stringify(audit.explanation))}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/dashboard', { state: { audit } })}
                                className="w-full mt-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600/10 group-hover:text-blue-400 cursor-pointer">
                                Review Session <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteHistory}
                title="Delete Audit History"
                message="Are you sure you want to delete all your audit logs? This action cannot be undone and you will lose all saved code analysis history."
            />
        </div>
    );
};

export default History;
