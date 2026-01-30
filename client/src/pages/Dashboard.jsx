import React, { useState, useEffect } from 'react';
import { Loader2, Play, Check, Copy, AlertTriangle, Clock, Database, ChevronRight, XCircle, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import CodeEditor from '../components/CodeEditor';
import ComplexityPlayground from '../components/ComplexityPlayground';

const Dashboard = () => {
    const location = useLocation();
    const { user, workspace, updateDashboardState } = useGlobal();

    // Derived state from Global Context
    const inputCode = workspace.dashboard.code;
    const auditResult = workspace.dashboard.analysisResult;
    const targetComplexity = workspace.dashboard.targetComplexity;

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);

    // Complexity Analysis State - Local for now, or could be global if needed
    const [complexityData, setComplexityData] = useState(null);
    const [activeTab, setActiveTab] = useState('audit');

    // Handle inputs
    const setInputCode = (code) => updateDashboardState({ code });
    const setTargetComplexity = (val) => updateDashboardState({ targetComplexity: val });
    const setAuditResult = (res) => updateDashboardState({ analysisResult: res });


    useEffect(() => {
        // Check for restored session from History
        if (location.state?.audit) {
            const { originalCode, fixedCode, explanation, riskLevel, timeComplexity, spaceComplexity } = location.state.audit;

            updateDashboardState({
                code: originalCode,
                analysisResult: {
                    fixedCode,
                    explanation,
                    riskLevel,
                    timeComplexity,
                    spaceComplexity
                },
                targetComplexity: ''
            });

            // Reset complexity analysis on restore
            setComplexityData(null);

            // Show toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            // Clean up state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleAnalyzeComplexity = async () => {
        setAnalyzing(true);
        setError(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/audit/analyze`, {
                code: inputCode
            });
            setComplexityData(response.data);
            setTargetComplexity('');
        } catch (err) {
            console.error("Analysis failed", err);
            setError("Failed to analyze complexity.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRunAudit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/audit`, {
                code: inputCode,
                userId: user?.$id || 'guest-session',
                targetComplexity: targetComplexity || null
            });

            if (response.data.saveError) {
                setError(`Analysis finished, but failed to save history: ${response.data.saveError}`);
            }

            updateDashboardState({ analysisResult: response.data });

            // Smooth scroll
            setTimeout(() => {
                window.scrollBy({ top: 300, behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error("Audit failed", err);
            setError(err.response?.data?.error || "Failed to connect to NexaBot server.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (auditResult?.fixedCode) {
            navigator.clipboard.writeText(auditResult.fixedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="max-w-7xl mx-auto px-6 pt-6 w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            NexaBot Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">AI-Powered Security Analysis</p>
                    </div>
                </header>

                <div className="flex gap-6 border-b border-gray-800 mb-8">
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'audit'
                            ? 'text-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Audit Workspace
                        {activeTab === 'audit' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('playground')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'playground'
                            ? 'text-teal-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Complexity Playground
                        {activeTab === 'playground' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 rounded-t-full"></span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'audit' && (
                <div className="max-w-7xl mx-auto px-6 pb-20 w-full">

                    <div className="flex justify-end mb-6">
                        <div className="flex items-center gap-3">
                            {/* Complexity Analysis Button */}
                            {!complexityData ? (
                                <button
                                    onClick={handleAnalyzeComplexity}
                                    disabled={analyzing || loading}
                                    className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-all text-sm text-gray-300 disabled:opacity-50"
                                >
                                    {analyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                    {analyzing ? 'Analyzing...' : 'Analyze Complexity'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 bg-gray-900/50 p-1.5 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-right">
                                    <div className="px-3 text-sm text-gray-400 border-r border-gray-700 pr-3">
                                        Current: <span className="text-red-400 font-mono font-bold">{complexityData.currentComplexity}</span>
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={targetComplexity}
                                            onChange={(e) => setTargetComplexity(e.target.value)}
                                            className="appearance-none bg-gray-800 text-sm text-gray-200 pl-3 pr-8 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
                                        >
                                            <option value="">Auto Optimize</option>
                                            {complexityData.achievableComplexities?.map((opt, i) => (
                                                <option key={i} value={opt}>Target: {opt}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleRunAudit}
                                disabled={loading || analyzing}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                                {loading ? 'Nexa is thinking...' : 'Run Nexa Audit'}
                            </button>
                        </div>
                    </div>

                    {showToast && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-in slide-in-from-right fade-in flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Restored previous audit session!
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Editors Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] mb-12">
                        {/* Input Section */}
                        <div className="flex flex-col h-full bg-[#1e1e1e]/50 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="p-3 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between">
                                <span className="font-semibold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Original Code
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                    <CodeEditor
                                        code={inputCode}
                                        setCode={setInputCode}
                                        decorations={auditResult?.vulnerabilities?.map(v => ({ ...v, category: 'vulnerability' })) || []}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="flex flex-col h-full bg-[#1e1e1e]/50 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="p-3 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between h-[45px]">
                                <span className="font-semibold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Nexa Optimized Fix
                                </span>
                                {auditResult && (
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                {auditResult ? (
                                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                        <CodeEditor
                                            code={auditResult.fixedCode}
                                            readOnly={false}
                                            setCode={(newCode) => setAuditResult({ ...auditResult, fixedCode: newCode })}
                                            decorations={auditResult?.optimizations?.map(o => ({ ...o, category: 'optimization' })) || []}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-6">
                                        <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-2">
                                            <Play className="w-6 h-6 opacity-40 ml-1" />
                                        </div>
                                        <p className="text-sm">Run an audit to see optimized results</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Analysis Summary Card */}
                    {auditResult && (
                        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                Analysis Report
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Risk Level
                                    </div>
                                    <div className={`text-2xl font-bold ${auditResult.riskLevel === 'High' ? 'text-red-500' :
                                        auditResult.riskLevel === 'Medium' ? 'text-amber-500' : 'text-green-500'
                                        }`}>
                                        {auditResult.riskLevel}
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-blue-500" /> Time Complexity
                                    </div>
                                    <div className="text-lg font-mono text-blue-300">
                                        {auditResult.timeComplexity || 'N/A'}
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-2">
                                        <Database className="w-3 h-3 text-purple-500" /> Space Complexity
                                    </div>
                                    <div className="text-lg font-mono text-purple-300">
                                        {auditResult.spaceComplexity || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300 leading-relaxed border-t border-gray-700 pt-4">
                                    {auditResult.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Complexity Playground Section */}
            {activeTab === 'playground' && (
                <ComplexityPlayground />
            )}
        </div>
    );
};

export default Dashboard;
