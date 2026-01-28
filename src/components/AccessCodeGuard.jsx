import React, { useState } from 'react';

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

            <style jsx>{`
                .access-guard-overlay {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle at center, #1a1e2e 0%, #0d0f17 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    font-family: 'Inter', sans-serif;
                }
                .access-guard-card {
                    width: 100%;
                    max-width: 400px;
                    padding: var(--p6, 48px);
                    border-radius: 24px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    animation: guard-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes guard-appear {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .guard-header { margin-bottom: 32px; }
                .guard-title { 
                    font-size: 1.5rem; 
                    font-weight: 800; 
                    letter-spacing: 0.1em; 
                    margin: 8px 0;
                    color: white;
                }
                .guard-subtitle { font-size: 0.9rem; color: var(--calm-gray, #94a3b8); opacity: 0.8; }
                .guard-form { display: flex; flexDirection: column; gap: 16px; }
                .input-group-premium { position: relative; margin-bottom: 8px; }
                input {
                    width: 100%;
                    padding: 14px 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                input:focus {
                    outline: none;
                    border-color: var(--muted-blue, #6366f1);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }
                input.error { border-color: #ef4444; }
                .error-message { 
                    color: #ef4444; 
                    font-size: 0.75rem; 
                    margin-top: 4px; 
                    display: block;
                    text-align: left;
                }
                .btn-verify {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-verify:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
                }
                .btn-verify:active { transform: translateY(0); }
                .guard-footer { margin-top: 40px; font-size: 0.7rem; opacity: 0.3; letter-spacing: 0.05em; color: white; }
            `}</style>
        </div>
    );
};

export default AccessCodeGuard;
