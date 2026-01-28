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
                setError(data.error || '?묎렐 肄붾뱶媛 ?щ컮瑜댁? ?딆뒿?덈떎.');
            }
        } catch (err) {
            setError('?쒕쾭 ?곌껐???ㅽ뙣?덉뒿?덈떎. ?ㅼ떆 ?쒕룄??二쇱꽭??');
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
                    <p className="guard-subtitle">???꾨줈洹몃옩? 珥덈????뚰듃???꾩슜?낅땲??</p>
                </div>

                <form onSubmit={handleSubmit} className="guard-form">
                    <div className="input-group-premium">
                        <input
                            type="text"
                            placeholder="珥덈? 肄붾뱶瑜??낅젰?섏꽭??
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
                        {isLoading ? '寃利?以?..' : '?뺤씤'}
                    </button>
                </form>

                <div className="guard-footer">
                    <p>짤 2026 CHART FINDER X ANTIGRAVITY</p>
                </div>
            </div>

        </div>
    );
};

export default AccessCodeGuard;
