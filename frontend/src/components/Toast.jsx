import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    return (
        <div className={`toast glass-card animate-slide-in ${type}`}>
            <div className="toast-icon">
                {type === 'success' ? (
                    <CheckCircle size={20} color="var(--success)" />
                ) : (
                    <XCircle size={20} color="var(--danger)" />
                )}
            </div>
            <div className="toast-content">
                <p>{message}</p>
            </div>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
