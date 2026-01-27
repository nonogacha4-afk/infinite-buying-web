import React from 'react';

const FetchResultModal = ({ isOpen, onClose, data, t }) => {
    if (!isOpen) return null;
    if (!data || !data.history) return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal">
                <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading Market Data...</p>
                </div>
            </div>
        </div>
    );

    const isSimulation = !!data.isSimulation;
    const ticker = data.ticker || '---';

    return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal">
                <div className="modal-header">
                    <h3 className="modal-title">{ticker} {t('fetchBtn')} {t('activeBadge')}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="fetch-summary">
                        <div className="summary-item">
                            <span className="label">{t('currentPriceLabel')}</span>
                            <span className="value">${typeof data.price === 'number' ? data.price.toFixed(2) : '---'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">RSI</span>
                            <span className="value">{typeof data.rsi === 'number' ? data.rsi.toFixed(1) : '---'}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', fontSize: '0.7rem', color: 'var(--calm-gray)', padding: '0 4px 12px 0' }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: isSimulation ? 'var(--action-sell)' : 'var(--action-buy)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            {isSimulation ? 'Simulation (Connection Failed)' : 'Source: Google / Stooq'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {new Date().toLocaleString()}
                        </span>
                    </div>

                    <h4 className="body-subtitle">{t('historyTitle')}</h4>
                    <div className="scrollable-table-container" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                        <table className="log-table fetch-history-table">
                            <thead>
                                <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                    <th>{t('dateHead')}</th>
                                    <th>{t('closeHead')}</th>
                                    <th>{t('changeHead')}</th>
                                    <th>RSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(data.history) ? data.history : []).slice().reverse().map((h, i) => (
                                    <tr key={i}>
                                        <td style={{ color: 'var(--calm-gray)', fontSize: '0.8rem', paddingLeft: '15px' }}>{h.date}</td>
                                        <td style={{ fontWeight: '700' }}>${typeof h.close === 'number' ? h.close.toFixed(2) : '---'}</td>
                                        <td className={parseFloat(h.change) >= 0 ? 'text-buy' : 'text-sell'}>{h.change}%</td>
                                        <td style={{ paddingRight: '15px' }}>{typeof h.rsi === 'number' ? h.rsi.toFixed(1) : '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FetchResultModal;
