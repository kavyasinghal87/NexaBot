import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

import { useGlobal } from '../context/GlobalContext';

const CodeEditor = ({ code, setCode, readOnly = false, decorations = [], className = '' }) => {
    const { settings } = useGlobal();

    // Default to 14 if settings isn't ready, though it should be.
    const fontSize = settings?.fontSize || 14;

    // Standardizing dimensions for overlay calculation
    // Line height is usually 1.5x font size. But to keep decorations aligned we might need a fixed multiplier or dynamic calculation.
    // Let's use 1.5 * fontSize.
    const lineHeightVal = fontSize * 1.5;
    const LINE_HEIGHT = lineHeightVal;
    const TOP_PADDING = 16;

    // Theme Colors Mapping
    const themeStyles = {
        'nexa-dark': { bg: '#1e1e1e', color: '#f8f8f2' },
        'monokai': { bg: '#272822', color: '#f8f8f2' },
        'github-light': { bg: '#ffffff', color: '#24292e' }
    };

    const currentTheme = themeStyles[settings?.theme] || themeStyles['nexa-dark'];

    return (
        <div
            className={`rounded-lg overflow-hidden border border-gray-700 font-mono text-sm shadow-inner relative ${className}`}
            style={{ backgroundColor: currentTheme.bg }}
        >

            {/* Decorations Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {decorations.map((deco, index) => {
                    const topPos = TOP_PADDING + ((deco.line - 1) * LINE_HEIGHT);

                    // Skip invalid lines
                    if (!deco.line || deco.line < 1) return null;

                    return (
                        <div
                            key={index}
                            style={{ top: `${topPos}px`, height: `${LINE_HEIGHT}px` }}
                            className="absolute w-full left-0 right-0 flex items-center group pointer-events-auto"
                        >
                            {/* Underline/Highlight Effect */}
                            <div className={`absolute inset-x-0 bottom-0 h-[2px] opacity-60 ${deco.category === 'optimization' ? 'bg-green-500' : 'bg-red-500'
                                } ${deco.category !== 'optimization' ? 'wavy-underline' : ''}`}></div>

                            {/* Badge */}
                            <div className={`absolute right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg cursor-help transition-all hover:scale-105 ${deco.category === 'optimization'
                                ? 'bg-green-900/80 text-green-300 border border-green-500/30'
                                : 'bg-red-900/80 text-red-300 border border-red-500/30'
                                }`}>
                                {deco.type}

                                {/* Tooltip */}
                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-gray-200 text-xs rounded border border-gray-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {deco.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Editor
                value={code}
                onValueChange={code => !readOnly && setCode(code)}
                highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                padding={TOP_PADDING}
                readOnly={readOnly}
                style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: fontSize,
                    lineHeight: `${LINE_HEIGHT}px`,
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.color,
                    minHeight: '300px',
                }}
                textareaClassName="focus:outline-none"
            />
        </div>
    );
};

export default CodeEditor;
