import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, History as HistoryIcon, Settings, LogOut, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { logout } from '../services/appwrite';
import { useGlobal } from '../context/GlobalContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useGlobal();
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0F172A] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-10 text-gray-300 transition-all duration-300 ease-in-out`}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-6 bg-blue-600 rounded-full p-1 text-white shadow-lg border border-gray-800 hover:bg-blue-500 transition-colors z-20"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className={`p-6 border-b border-gray-800 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center px-2' : ''}`}>
                <img src="/logo.png" alt="NexaBot Logo" className="w-8 h-8 shrink-0 object-contain" />
                {!isCollapsed && (
                    <span className="font-bold text-xl text-white tracking-tight animate-in fade-in duration-300 whitespace-nowrap">NexaBot</span>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-hidden">
                <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${isActive('/dashboard') ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800/50 hover:text-white'} ${isCollapsed ? 'justify-center px-2' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>
                <Link to="/testbench" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${isActive('/testbench') ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800/50 hover:text-white'} ${isCollapsed ? 'justify-center px-2' : ''}`} title={isCollapsed ? "Virtual Test Bench" : ""}>
                    <FlaskConical className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>Virtual Test Bench</span>}
                </Link>
                <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${isActive('/history') ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800/50 hover:text-white'} ${isCollapsed ? 'justify-center px-2' : ''}`} title={isCollapsed ? "History" : ""}>
                    <HistoryIcon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>History</span>}
                </Link>

                {!isCollapsed && <div className="h-px bg-gray-800 my-4 mx-2"></div>}

                <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${isActive('/settings') ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800/50 hover:text-white'} ${isCollapsed ? 'justify-center px-2' : ''}`} title={isCollapsed ? "Settings" : ""}>
                    <Settings className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </nav>

            <div className={`p-4 border-t border-gray-800 overflow-hidden ${isCollapsed ? 'flex justify-center' : ''}`}>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg text-sm transition-colors cursor-pointer overflow-hidden whitespace-nowrap ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};


export default Sidebar;
