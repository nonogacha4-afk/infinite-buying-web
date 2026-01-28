import React, { useState } from 'react';
import './AccessCodeGuard.css';

const AccessCodeGuard = ({ onVerified, t }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await response.json();

            if (data.success) {
                onVerified(data.token);
            } else {
                setError(data.error || t('guard_error_invalid'));
            }
        } catch (err) {
            setError(t('guard_error_server'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="access-guard-overlay">
            <div className="access-guard-card glass">
                <div className="guard-header">
                    <span className="brand-accent">LAO</span>
                    <h2 className="guard-title">PRIVATE ACCESS</h2>
                    <p className="guard-subtitle">{t('guard_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="guard-form">
                    <div className="input-group-premium">
                        <input
                            type="text"
                            placeholder={t('guard_placeholder')}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={error ? 'error' : ''}
                            autoFocus
                        />
                        {error && <span className="error-message">{error}</span>}
                    </div>

                    <button
                        type="submit"
                        className={`btn-verify ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? t('guard_loading') : t('guard_confirm')}
                    </button>
                </form>

                <div className="guard-footer">
                    <p>© 2026 CHART FINDER X ANTIGRAVITY</p>
                </div>
            </div>

        </div>
    );
};

export default AccessCodeGuard;
