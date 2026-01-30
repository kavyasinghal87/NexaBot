import React, { useState, useMemo } from 'react';
import CodeEditor from './CodeEditor';
import { Loader2, Zap, AlertTriangle, Play } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, comparison }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#111827] border border-gray-700 p-4 rounded-lg shadow-xl backdrop-blur-sm bg-opacity-95">
                <p className="text-gray-400 text-xs mb-2">Input Size (N): <span className="text-gray-200 font-mono font-bold text-sm">{label}</span></p>
                <div className="flex flex-col gap-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-300 text-sm">{entry.name.split(' (')[0]}:</span>
                            <span className="text-white font-mono font-bold">
                                {entry.value >= 1000 ? `${(entry.value / 1000).toFixed(1)}k` : Math.round(entry.value)} ops
                            </span>
                        </div>
                    ))}
                </div>
                {comparison && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <p className="text-xs text-gray-500 italic">
                            {comparison.A.complexity === comparison.B.complexity
                                ? "Algorithms have similar growth rates."
                                : payload[0].value < payload[1].value
                                    ? "Candidate A is currently more efficient."
                                    : "Candidate B is currently more efficient."}
                        </p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const ComplexityPlayground = () => {
    const [codeA, setCodeA] = useState('// Candidate A (e.g., Bubble Sort)\nfor(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    // O(n^2)\n  }\n}');
    const [codeB, setCodeB] = useState('// Candidate B (e.g., Linear Scan)\nfor(let i=0; i<n; i++) {\n  // O(n)\n}');

    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inputSize, setInputSize] = useState(100); // Increased default


    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/audit/compare`, { codeA, codeB });
            setComparison(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Generate Graph Data based on parsed complexity
    const chartData = useMemo(() => {
        if (!comparison) return [];

        const data = [];
        const Step = Math.floor(inputSize / 20) || 1; // 20 data points

        for (let n = 1; n <= inputSize; n += Step) {
            let valA = 0;
            let valB = 0;

            // Simple parsing of O-notation to approximate curves
            // This is a simulation visualization, not an exact benchmark
            const evalComplexity = (comp, n) => {
                const c = comp.toLowerCase();
                if (c.includes('n^2')) return n * n;
                if (c.includes('n log n')) return n * Math.log2(n);
                if (c.includes('log n')) return Math.log2(n);
                if (c.includes('n')) return n;
                return 1; // O(1)
            };

            if (comparison.A.valid) valA = evalComplexity(comparison.A.complexity, n);
            if (comparison.B.valid) valB = evalComplexity(comparison.B.complexity, n);

            data.push({ n, A: valA, B: valB });
        }
        return data;
    }, [comparison, inputSize]);

    return (
        <div className="border-t border-gray-800 bg-[#0d121f] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <Zap className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-100">Complexity Playground</h2>
                        <p className="text-teal-400/80 text-sm">Compare algorithms side-by-side in a laboratory environment.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Candidate A */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">Candidate A</span>
                            {comparison?.A && (
                                !comparison.A.valid ?
                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Fix to visualize</span>
                                    : <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded font-mono">{comparison.A.complexity}</span>
                            )}
                        </div>
                        <div className={`rounded-xl border ${comparison?.A?.valid === false ? 'border-red-500/50' : 'border-purple-500/30'} overflow-hidden h-[300px] relative`}>
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                <CodeEditor code={codeA} setCode={setCodeA} />
                            </div>
                        </div>
                    </div>

                    {/* Candidate B */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-teal-400 uppercase tracking-wider">Candidate B</span>
                            {comparison?.B && (
                                !comparison.B.valid ?
                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Fix to visualize</span>
                                    : <span className="text-xs bg-teal-500/10 text-teal-300 px-2 py-1 rounded font-mono">{comparison.B.complexity}</span>
                            )}
                        </div>
                        <div className={`rounded-xl border ${comparison?.B?.valid === false ? 'border-red-500/50' : 'border-teal-500/30'} overflow-hidden h-[300px] relative`}>
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                <CodeEditor code={codeB} setCode={setCodeB} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls & Graph */}
                <div className="bg-[#1e1e1e]/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold text-white transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                            Run Simulation
                        </button>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <span className="text-sm text-gray-400 whitespace-nowrap">Input Size (N): {inputSize}</span>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                step="10"
                                value={inputSize}
                                onChange={(e) => setInputSize(Number(e.target.value))}
                                className="w-full md:w-64 accent-teal-500"
                            />
                        </div>
                    </div>

                    {/* Graph Area */}
                    <div className="h-[400px] w-full bg-[#0b1120] rounded-lg border border-gray-800/50 p-4">
                        {comparison && comparison.A.valid && comparison.B.valid ? (

                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis
                                        dataKey="n"
                                        stroke="#6b7280"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        label={{ value: 'Input Size (N)', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                        label={{ value: 'Estimated Operations', angle: -90, position: 'insideLeft', fill: '#6b7280', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip content={<CustomTooltip comparison={comparison} />} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Line
                                        type="monotone"
                                        dataKey="A"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        name={`Candidate A (${comparison.A.complexity})`}
                                        animationDuration={1500}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="B"
                                        stroke="#14b8a6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        name={`Candidate B (${comparison.B.complexity})`}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (

                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <Zap className="w-12 h-12 mb-2 opacity-20" />
                                <p>Run simulation to visualize performance</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ComplexityPlayground;
