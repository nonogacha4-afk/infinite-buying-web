import React from 'react';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, t }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop confirm-modal-backdrop">
            <div className="modal-content confirm-modal-content">
                <div className="confirm-icon-section">
                    <div className="confirm-warning-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                </div>

                <div className="confirm-body">
                    <h3 className="confirm-title">{t('systemStatus')}</h3>
                    <p className="confirm-message">{message}</p>
                </div>

                <div className="confirm-footer">
                    <button className="confirm-btn confirm-btn-proceed" onClick={onConfirm}>
                        {t('go')}
                    </button>
                    <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
