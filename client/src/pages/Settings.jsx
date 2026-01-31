import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Type, Palette, Save, Check, Moon, Sun, Terminal } from 'lucide-react';

const Settings = () => {
    const { settings, updateSettings } = useGlobal();

    const themes = [
        { id: 'nexa-dark', name: 'Nexa Dark', icon: <Terminal className="w-4 h-4" />, color: 'bg-[#1e1e1e]' },
        { id: 'monokai', name: 'Monokai', icon: <Moon className="w-4 h-4" />, color: 'bg-[#272822]' },
        { id: 'github-light', name: 'GitHub Light', icon: <Sun className="w-4 h-4" />, color: 'bg-white' },
    ];

    return (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-6 pt-6 w-full pb-20">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Settings
                    </h1>
                    <p className="text-gray-400 mt-1">Customize your workspace experience</p>
                </header>

                <div className="space-y-6">
                    {/* Editor Customization Section */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-200">Editor Customization</h2>
                                <p className="text-sm text-gray-500">Personalize how you view and write code</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Font Size Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-medium text-gray-300 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-gray-400" />
                                        Font Size
                                    </label>
                                    <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-3 py-1 rounded text-sm">
                                        {settings.fontSize}px
                                    </span>
                                </div>
                                <div className="relative pt-1">
                                    <input
                                        type="range"
                                        min="12"
                                        max="22"
                                        step="1"
                                        value={settings.fontSize}
                                        onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-2 font-mono">
                                        <span>12px</span>
                                        <span>17px</span>
                                        <span>22px</span>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Selector */}
                            <div className="space-y-4">
                                <label className="text-base font-medium text-gray-300 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-gray-400" />
                                    Syntax Theme
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {themes.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateSettings({ theme: theme.id })}
                                            className={`group relative p-4 rounded-xl border transition-all duration-200 text-left overflow-hidden ${settings.theme === theme.id
                                                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50'
                                                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.theme === theme.id ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                    {theme.icon}
                                                </div>
                                                {settings.theme === theme.id && (
                                                    <Check className="w-4 h-4 text-blue-400 animate-in zoom-in" />
                                                )}
                                            </div>
                                            <h3 className={`font-medium ${settings.theme === theme.id ? 'text-blue-200' : 'text-gray-300'}`}>
                                                {theme.name}
                                            </h3>

                                            {/* Preview Strip */}
                                            <div className="mt-3 h-2 w-full rounded-full overflow-hidden flex opacity-80">
                                                {/* Approximate representation of theme colors */}
                                                <div className={`h-full w-1/3 ${theme.id === 'github-light' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                                                <div className={`h-full w-1/3 ${theme.id === 'github-light' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                                <div className={`h-full w-1/3 ${theme.id === 'github-light' ? 'bg-gray-800' : 'bg-yellow-400'}`}></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Auto-Save Toggle */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                <div className="space-y-1">
                                    <label className="text-base font-medium text-gray-300 flex items-center gap-2">
                                        <Save className="w-4 h-4 text-gray-400" />
                                        Auto-Save Progress
                                    </label>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        Automatically save your changes to prevent data loss.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${settings.autoSave ? 'bg-blue-600' : 'bg-gray-700'}`}
                                >
                                    <span
                                        className={`${settings.autoSave ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
