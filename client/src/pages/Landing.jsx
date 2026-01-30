import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Landing = () => (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/20 mb-6 ring-1 ring-blue-500/30">
                <img src="/logo.png" alt="NexaBot" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-blue-200">
                Secure Your Code with AI
            </h1>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                NexaBot analyzes your code for security vulnerabilities, complexity issues, and bugs in real-time.
            </p>
            <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-900/20"
            >
                Start New Audit
            </Link>
        </div>
    </div>
);

export default Landing;
