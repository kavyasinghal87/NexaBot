import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { ShieldCheck, Loader2 } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import TestBench from './pages/TestBench'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import Footer from './components/Footer'
import { GlobalProvider, useGlobal } from './context/GlobalContext'

// PrivateRoute Component
const PrivateRoute = ({ children }) => {
  const { user } = useGlobal();
  return user ? children : <Navigate to="/login" />;
};

// Global App Content with Access to Context
const AppContent = () => {
  const { loading, user } = useGlobal();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('nexa_sidebar_collapsed') === 'true';
  });

  if (loading) {
    // Splash Screen
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <ShieldCheck className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-gray-200 tracking-wider">NEXA AUDIT</h2>
        <p className="text-gray-500 text-sm mt-2 font-mono">Initializing Secure Environment...</p>
      </div>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('nexa_sidebar_collapsed', newVal);
      return newVal;
    });
  };

  const sidebarWidthClass = isSidebarCollapsed ? 'pl-20' : 'pl-64';

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col">
        <ConditionalSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
                    <Dashboard />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
                    <History />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/testbench"
              element={
                <PrivateRoute>
                  <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
                    <TestBench />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
                    <Settings />
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  )
}

const ConditionalFooter = () => {
  const location = useLocation();
  // Hide footer on Dashboard and History pages
  const hideFooter = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/history') || location.pathname.startsWith('/testbench') || location.pathname.startsWith('/settings');
  return !hideFooter ? <Footer /> : null;
}

const ConditionalSidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  // Don't show sidebar on landing or login page
  if (location.pathname === '/' || location.pathname === '/login') return null;
  return <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />;
}

export default App
