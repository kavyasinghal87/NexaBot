import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20"
                    >
                        Delete History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
