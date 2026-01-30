import React, { useState, useRef, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import { Play, Terminal, Plus, Trash2, Cpu, CheckCircle2, XCircle, Loader2, Sparkles, Box, GripHorizontal, Copy, FlaskConical } from 'lucide-react';
import axios from 'axios';
import { useGlobal } from '../context/GlobalContext';

const TestBench = () => {
    const { workspace, updateTestBenchState } = useGlobal();

    // Derived State from Global Context
    const code = workspace.testBench.code;
    const testCases = workspace.testBench.testCases;
    const results = workspace.testBench.results;
    const manualInput = workspace.testBench.manualInput;
    const manualExpected = workspace.testBench.manualExpected;
    const mode = workspace.testBench.mode;

    // Local UI state (doesn't need persistence)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState(['> Virtual Test Bench Environment Initialized...', '> Ready for code verification.']);

    // Setters wrapper
    const setCode = (val) => updateTestBenchState({ code: val });
    const setMode = (val) => updateTestBenchState({ mode: val });
    const setManualInput = (val) => updateTestBenchState({ manualInput: val });
    const setManualExpected = (val) => updateTestBenchState({ manualExpected: val });
    const setTestCases = (val) => updateTestBenchState({ testCases: typeof val === 'function' ? val(testCases) : val });
    const setResults = (val) => updateTestBenchState({ results: val });

    // Layout State
    const [terminalHeight, setTerminalHeight] = useState(() => {
        const saved = localStorage.getItem('terminalHeight');
        return saved ? parseInt(saved, 10) : 192;
    });
    const isResizing = useRef(false);

    useEffect(() => {
        // Re-calculate stats on mount if results exist
        if (results && results.length > 0) {
            const passed = results.filter(r => r.passed).length;
            setStats({
                total: results.length,
                passed,
                rate: Math.round((passed / results.length) * 100)
            });
        }
    }, [results]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            // Calculate new height: Window Height - Mouse Y - Bottom Padding (approx 20px)
            const newHeight = window.innerHeight - e.clientY - 20;
            // Clamp height: Min 100px, Max (Window - 200px)
            if (newHeight >= 100 && newHeight <= window.innerHeight - 200) {
                setTerminalHeight(newHeight);
                localStorage.setItem('terminalHeight', newHeight);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResizing = (e) => {
        isResizing.current = true;
        document.body.style.cursor = 'row-resize';
        e.preventDefault(); // Prevent text selection
    };

    const addLog = (msg) => {
        setTerminalLogs(prev => [...prev, `> ${msg}`]);
    };

    const handleGenerateCases = async () => {
        setGenerating(true);
        addLog('Analyzing code structure for edge cases...');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/testbench/cases`, { code });
            setTestCases(response.data.testCases || []);
            addLog(`Generated ${response.data.testCases?.length || 0} rigorous test cases.`);
            setMode('batch'); // Switch to batch view
        } catch (error) {
            addLog('Error generating cases: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleAddManualCase = () => {
        setTestCases(prev => [
            ...prev,
            { input: manualInput, expectedOutput: manualExpected, description: 'Manual Test Case' }
        ]);
        setManualInput('');
        setManualExpected('');
        addLog('Added manual test case to batch queue.');
    };

    const handleRunTests = async () => {
        setLoading(true);
        setResults(null);
        setStats(null);

        // Prepare cases
        const casesToRun = mode === 'manual'
            ? [{ input: manualInput, expectedOutput: manualExpected, description: 'Single Manual Run' }]
            : testCases;

        if (casesToRun.length === 0) {
            addLog('No test cases to run.');
            setLoading(false);
            return;
        }

        addLog(`Initializing Virtual Runtime for ${casesToRun.length} cases...`);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/testbench/run`, {
                code,
                testCases: casesToRun
            });

            let runResults = response.data.results;

            // Strict Client-Side Validation for Manual Mode
            // This ensures status is frozen until the next run and checks strict equality
            if (mode === 'manual' && runResults.length === 1) {
                const normalize = (str) => (str || '').replace(/\r\n/g, '\n').trim();
                const actual = normalize(runResults[0].actualOutput);
                const expected = normalize(manualExpected);
                runResults[0].passed = actual === expected;
            }

            setResults(runResults);

            // Calculate stats
            const passed = runResults.filter(r => r.passed).length;
            setStats({
                total: runResults.length,
                passed,
                rate: Math.round((passed / runResults.length) * 100)
            });

            addLog(`Execution Complete. Passed: ${passed}/${runResults.length}`);

        } catch (error) {
            addLog('Runtime Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        addLog('Copied to clipboard');
    };

    return (
        <div className="flex flex-col h-screen bg-[#020617] text-gray-100 overflow-hidden">
            {/* Header */}
            <div className="h-20 border-b border-gray-800 bg-[#0b1120] px-6 flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Test Bench</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateCases}
                        disabled={generating || loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded text-xs font-medium transition-all"
                    >
                        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        AI Auto-Gen Cases
                    </button>
                    {mode === 'batch' && (
                        <button
                            onClick={handleRunTests}
                            disabled={loading || testCases.length === 0}
                            className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            Run Verification
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area - Flexible Layout */}
            <div className="flex-1 p-4 pb-0 flex flex-col overflow-hidden">


                {/* Top Section: Split View */}
                <div className="flex-1 flex gap-4 min-h-0">
                    {/* Left: Source Code Card */}
                    <div className="w-1/2 flex flex-col bg-[#0b1120] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#0f1623]">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Cpu className="w-4 h-4" /> Source Code
                            </span>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                <CodeEditor
                                    code={code}
                                    setCode={setCode}
                                    className="min-h-full border-none rounded-none !bg-[#0b1120]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Test Manager Card */}
                    <div className="w-1/2 flex flex-col bg-[#0b1120] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                        {/* Mode Switcher Tabs */}
                        <div className="flex border-b border-gray-800 bg-[#0f1623]">
                            <button
                                onClick={() => setMode('manual')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'manual' ? 'text-blue-400 bg-[#1e293b]/50 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e293b]/30'}`}
                            >
                                Manual Input
                            </button>
                            <button
                                onClick={() => setMode('batch')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'batch' ? 'text-purple-400 bg-[#1e293b]/50 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e293b]/30'}`}
                            >
                                Batch / AI Cases ({testCases.length})
                            </button>
                        </div>

                        <div className={`flex-1 overflow-hidden p-6 bg-[#0b1120] ${mode === 'manual' ? 'flex flex-col' : 'overflow-y-auto custom-scrollbar'}`}>
                            {mode === 'manual' ? (
                                <div className="flex flex-row h-full gap-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                                        <div className="flex justify-between items-center shrink-0">
                                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Input</label>
                                            <button onClick={() => handleCopy(manualInput)} className="text-gray-500 hover:text-white transition-colors" title="Copy Input">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <textarea
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            className="flex-1 w-full bg-[#171e2e] border border-gray-700/50 rounded-lg p-3 font-mono text-base text-gray-200 focus:border-blue-500/50 focus:bg-[#1e293b] focus:outline-none resize-none transition-all placeholder:text-gray-600"
                                            placeholder="Enter input values here..."
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                                        <div className="flex justify-between items-center shrink-0">
                                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expected Output</label>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleCopy(manualExpected)} className="text-gray-500 hover:text-white transition-colors" title="Copy Expected Output">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={handleRunTests}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wide disabled:opacity-50"
                                                >
                                                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                                    Run Manual Test
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={manualExpected}
                                            onChange={(e) => {
                                                setManualExpected(e.target.value);
                                                if (results && results.length === 1 && results[0].passed !== undefined) {
                                                    const newResults = [...results];
                                                    delete newResults[0].passed;
                                                    setResults(newResults);
                                                }
                                            }}
                                            className="flex-1 w-full bg-[#171e2e] border border-gray-700/50 rounded-lg p-3 font-mono text-base text-gray-200 focus:border-blue-500/50 focus:bg-[#1e293b] focus:outline-none resize-none transition-all placeholder:text-gray-600"
                                            placeholder="Enter expected output logic..."
                                        />
                                    </div>
                                    {results && results.length === 1 && (
                                        <div className="flex-1 flex flex-col gap-2 min-h-0 animate-in fade-in slide-in-from-right-8">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider shrink-0">Actual Output</label>
                                                {results[0].status === 'timeout' ? (
                                                    <span className="text-orange-400 text-[10px] font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">TIMEOUT</span>
                                                ) : results[0].status === 'runtime_error' ? (
                                                    <span className="text-rose-400 text-[10px] font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">RUNTIME ERROR</span>
                                                ) : results[0].passed ? (
                                                    <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded">PASSED</span>
                                                ) : (
                                                    <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded">FAILED</span>
                                                )}
                                                <button onClick={() => handleCopy(results[0].actualOutput)} className="text-gray-500 hover:text-white transition-colors ml-auto" title="Copy Actual Output">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className={`flex-1 w-full bg-[#171e2e] border rounded-lg p-3 font-mono text-base font-bold text-gray-100 overflow-auto custom-scrollbar whitespace-pre-wrap ${results[0].passed ? 'border-green-500/20' : 'border-red-500/20'}`}>
                                                {results[0].actualOutput}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    {results && stats && (
                                        <div className={`mb-6 p-4 rounded-lg border flex justify-between items-center shadow-lg transition-all ${stats.total === stats.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            <div className="flex items-center gap-3">
                                                {stats.total === stats.passed ? (
                                                    <div className="p-2 bg-green-500/20 rounded-full">
                                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-red-500/20 rounded-full">
                                                        <XCircle className="w-6 h-6 text-red-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className={`font-bold text-lg tracking-tight ${stats.total === stats.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                        {stats.total === stats.passed ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 font-mono">
                                                        {stats.passed} passed, {stats.total - stats.passed} failed
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="px-3 py-1 bg-black/30 rounded text-xs font-mono border border-white/5 text-gray-300">
                                                Rate: <span className={stats.total === stats.passed ? 'text-green-400' : 'text-red-400'}>{stats.rate}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {testCases.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                                            <Box className="w-10 h-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No test cases queued</p>
                                            <button onClick={handleGenerateCases} className="text-blue-500 hover:text-blue-400 mt-2 text-xs font-bold uppercase tracking-wide">Generate with AI</button>
                                        </div>
                                    ) : (
                                        testCases.map((tc, i) => {
                                            const res = results ? results[i] : null;
                                            return (
                                                <div key={i} className="bg-[#171e2e] rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors group mb-3 last:mb-0">
                                                    <div className="px-4 py-3 border-b border-gray-800/50 flex justify-between items-center bg-[#1e293b]/30">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded font-bold">#{i + 1}</span>
                                                            <div className="text-sm font-bold font-mono text-white bg-[#0b1120] px-2 py-1 rounded border border-gray-800/50">
                                                                In: {tc.input}
                                                            </div>
                                                        </div>
                                                        {res && (
                                                            <div className="flex items-center gap-2">
                                                                {res.status === 'timeout' ? (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-bold uppercase tracking-wider">
                                                                        <XCircle className="w-4 h-4" /> Timeout
                                                                    </div>
                                                                ) : res.status === 'runtime_error' ? (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">
                                                                        <XCircle className="w-4 h-4" /> Error
                                                                    </div>
                                                                ) : res.passed ? (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold uppercase tracking-wider">
                                                                        <CheckCircle2 className="w-4 h-4" /> Passed
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold uppercase tracking-wider">
                                                                        <XCircle className="w-4 h-4" /> Failed
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4 grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expected</span>
                                                            <div className="bg-[#0b1120] p-3 rounded font-mono text-sm font-bold text-gray-100 border border-gray-800/50 break-words whitespace-pre-wrap">
                                                                {tc.expectedOutput}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Received</span>
                                                            <div className={`bg-[#0b1120] p-3 rounded font-mono text-sm font-bold border break-words whitespace-pre-wrap ${res ? (res.passed ? 'text-gray-100 border-gray-800/50' : 'text-red-400 border-red-500/30 bg-red-950/10') : 'text-gray-500 border-gray-800/50 italic'}`}>
                                                                {res ? res.actualOutput : 'Pending...'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    className="h-4 flex items-center justify-center cursor-row-resize hover:bg-gray-800/50 transition-colors shrink-0 z-10 select-none"
                    onMouseDown={startResizing}
                >
                    <div className="w-16 h-1 bg-gray-700 rounded-full flex items-center justify-center">
                        <GripHorizontal className="w-3 h-3 text-gray-500" />
                    </div>
                </div>

                {/* Bottom: Terminal Card */}
                <div
                    style={{ height: terminalHeight }}
                    className="bg-[#0b1120] rounded-t-xl border-t border-x border-gray-800 shadow-xl overflow-hidden flex flex-col shrink-0"
                >
                    <div className="px-4 py-2 border-b border-gray-800 bg-[#0f1623] flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> System Terminal
                        </span>
                        <button onClick={() => setTerminalLogs([])} className="text-gray-600 hover:text-gray-300 text-[10px] uppercase font-bold tracking-wider">Clear Logs</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar font-mono text-sm bg-[#0b0f19]">
                        {terminalLogs.map((log, i) => (
                            <div key={i} className={`break-words ${log.includes('Error') || log.includes('Failed') ? 'text-red-400' : log.includes('Success') || log.includes('Passed') ? 'text-green-400' : 'text-gray-500'}`}>
                                <span className="opacity-30 mr-2">$</span>{log.replace('> ', '')}
                            </div>
                        ))}
                        {loading && <div className="text-blue-500 animate-pulse"><span className="opacity-30 mr-2">$</span> Executing...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Results
const ResultCard = ({ result, expected, minimal = false }) => {
    return (
        <div className={`mt-0 ${!minimal ? 'border-t border-gray-700 pt-4' : 'border-t border-gray-800 bg-black/20 p-3'}`}>
            <div className="flex items-center gap-2 mb-2">
                {result.passed ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded">
                        <CheckCircle2 className="w-4 h-4" /> Passed
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                        <XCircle className="w-4 h-4" /> Failed
                    </span>
                )}
            </div>

            {/* Expected vs Actual Comparison Panel */}
            <div className="mt-3 grid grid-cols-2 gap-3">
                {/* Expected Panel */}
                <div className="bg-[#0b1120] rounded-md border border-gray-800/50 overflow-hidden">
                    <div className="px-2 py-1 bg-[#1e293b]/50 border-b border-gray-800/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Expected Output (stdout)
                    </div>
                    <div className="p-2 font-mono text-xs text-gray-300 break-words whitespace-pre-wrap">
                        {expected || "N/A"}
                    </div>
                </div>

                {/* Received Panel */}
                <div className={`rounded-md border overflow-hidden ${result.passed ? 'bg-[#0b1120] border-gray-800/50' : 'bg-red-950/10 border-red-500/20'}`}>
                    <div className="px-2 py-1 bg-[#1e293b]/50 border-b border-gray-800/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                        <span>Received Output (Actual)</span>
                        {!result.passed && <span className="text-red-400 text-[9px] font-bold">MISMATCH</span>}
                    </div>
                    <div className={`p-2 font-mono text-xs break-words whitespace-pre-wrap ${result.passed ? 'text-gray-300' : 'text-red-300'}`}>
                        {result.actualOutput}
                    </div>
                </div>
            </div>

            {!minimal && result.logs && result.logs.length > 0 && (
                <div className="mt-3 bg-black/40 p-2 rounded text-xs font-mono text-gray-500">
                    {result.logs.slice(-3).map((l, i) => <div key={i}>{l}</div>)}
                </div>
            )}
        </div>
    );
};

export default TestBench;
