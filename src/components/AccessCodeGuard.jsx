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
                setError(data.error || '접근 코드가 올바르지 않습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다. 다시 시도해 주세요.');
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
                    <p className="guard-subtitle">이 프로그램은 초대된 파트너 전용입니다.</p>
                </div>

                <form onSubmit={handleSubmit} className="guard-form">
                    <div className="input-group-premium">
                        <input
                            type="text"
                            placeholder="초대 코드를 입력하세요"
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
                        {isLoading ? '검증 중...' : '확인'}
                    </button>
                </form>

                <div className="guard-footer">
                    <p>© 2026 CHART FINDER X ANTIGRAVITY</p>
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
