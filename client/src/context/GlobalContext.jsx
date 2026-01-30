import React, { createContext, useContext, useState, useEffect } from 'react';
import { ensureSession, logout as appwriteLogout, login as appwriteLogin } from '../services/appwrite';

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    // --- Auth State ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial splash screen state

    // --- Workspace State ---
    // These ensure data persists across tab switches
    const [workspace, setWorkspace] = useState({
        dashboard: {
            code: '// Write your code here to audit...', // Initial Placeholder
            analysisResult: null,
            targetComplexity: 'O(n)'
        },
        testBench: {
            code: '// Write your C++ Logic here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (n * 2) << endl;\n    }\n    return 0;\n}',
            testCases: [],
            results: null,
            manualInput: '5',
            manualExpected: '10',
            mode: 'manual'
        }
    });

    // --- Initialization ---
    useEffect(() => {
        const initAuth = async () => {
            try {
                const sessionUser = await ensureSession();
                setUser(sessionUser);
            } catch (error) {
                console.error("Auth Check Failed", error);
                setUser(null);
            } finally {
                // Determine if we need to show splash screen longer? No, generic load is fine.
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // --- Actions ---

    const login = async (email, password) => {
        try {
            await appwriteLogin(email, password);
            const sessionUser = await ensureSession();
            setUser(sessionUser);
            // On fresh login, reset workspace
            resetWorkspace();
            return sessionUser;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await appwriteLogout();
        setUser(null);
        resetWorkspace();
    };

    const resetWorkspace = () => {
        setWorkspace({
            dashboard: {
                code: '// Write your code here to audit...',
                analysisResult: null,
                targetComplexity: 'O(n)'
            },
            testBench: {
                code: '// Write your C++ Logic here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (n * 2) << endl;\n    }\n    return 0;\n}',
                testCases: [],
                results: null,
                manualInput: '5',
                manualExpected: '10',
                mode: 'manual'
            }
        });
    };

    const updateDashboardState = (updates) => {
        setWorkspace(prev => ({
            ...prev,
            dashboard: { ...prev.dashboard, ...updates }
        }));
    };

    const updateTestBenchState = (updates) => {
        setWorkspace(prev => ({
            ...prev,
            testBench: { ...prev.testBench, ...updates }
        }));
    };

    return (
        <GlobalContext.Provider value={{
            user,
            loading,
            workspace,
            login,
            logout,
            updateDashboardState,
            updateTestBenchState,
            resetWorkspace
        }}>
            {children}
        </GlobalContext.Provider>
    );
};
