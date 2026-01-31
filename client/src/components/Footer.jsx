import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ShieldCheck, Instagram } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-[#0b1120] border-t border-gray-800 text-gray-400 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Column 1: Branding */}
                    <div className="space-y-4">
                        <div
                            onClick={() => {
                                navigate('/');
                                window.scrollTo(0, 0);
                            }}
                            className="flex items-center gap-2 group cursor-pointer"
                        >
                            <div className="p-2 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                <img src="/logo.png" alt="NexaBot" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                NexaBot
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-500">
                            AI-Powered Code Security & Optimization platform designed for developers and students.
                            Secure your code with advanced static analysis.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 pt-2">
                            <Mail className="w-4 h-4" />
                            <a href="mailto:helpnexabot@gmail.com" className="hover:text-blue-400 transition-colors">helpnexabot@gmail.com</a>
                        </div>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">Product</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">Features</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">How it Works</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">Security Analysis</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">Supported Languages</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">Documentation</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">GitHub Repository</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">Project Report</button></li>
                            <li><button className="hover:text-blue-400 transition-colors text-left cursor-pointer">FAQ</button></li>
                        </ul>
                    </div>

                    {/* Column 4: Connect & About */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Connect & About Me</h3>
                        {/* Portfolio button removed as requested */}

                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/kavyasinghal87" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 hover:bg-pink-600/20 hover:text-pink-400 rounded-lg transition-all border border-gray-800 hover:border-pink-500/30">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/kavya-singhal-62b1a1322/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-all border border-gray-800 hover:border-blue-500/30">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://github.com/kavyasinghal87" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 hover:bg-gray-600/20 hover:text-white rounded-lg transition-all border border-gray-800 hover:border-gray-500/30">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-900 bg-[#020617] py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <p>© {new Date().getFullYear()} NexaBot. All rights reserved.</p>
                    <p className="font-medium text-gray-500 tracking-wide">
                        Made by Kavya Singhal
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
