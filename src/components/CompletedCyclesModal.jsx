import React from 'react';

const CompletedCyclesModal = ({ isOpen, onClose, cycles, onDelete, triggerConfirm, t }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal">
                <div className="modal-header">
                    <h3 className="modal-title">{t('cycleHistoryTitle')}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">

                    {cycles.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                            <button
                                className="btn-clear-logs"
                                onClick={() => triggerConfirm(t('clearLogBtn') + '?', () => onDelete('all'))}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                {t('clearLogBtn')}
                            </button>
                        </div>
                    )}

                    {/* DESKTOP TABLE VIEW */}
                    <div className="mobile-hide">
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th>{t('ticker')} / {t('cycleDate')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('cycleStartDate')} ~ {t('cycleEndDate')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('cycleDuration')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('turn')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('summaryInvestment')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('summaryProfitAmount')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('summaryProfitRate')} (ROE)</th>
                                    <th style={{ textAlign: 'right' }}>ROI</th>
                                    <th style={{ textAlign: 'right' }}>{t('orderAction')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cycles.length > 0 ? cycles.map((cycle, idx) => {
                                    const isPositive = cycle.profitKrw >= 0;
                                    return (
                                        <tr key={idx}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{cycle.ticker}</div>
                                                    {cycle.isFailed && (
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            background: 'rgba(239, 68, 68, 0.2)',
                                                            color: '#ef4444',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontWeight: '800',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)'
                                                        }}>FAILED</span>
                                                    )}
                                                </div>
                                                <div style={{ color: 'var(--calm-gray)', fontSize: '0.75rem' }}>{cycle.date} {cycle.endTime}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.85rem' }}>{cycle.startDate || '-'}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--calm-gray)' }}>~ {cycle.endDate || '-'}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '700' }}>
                                                {cycle.durationDays || '1'} {t('days')}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '600' }}>{cycle.turns}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {t('currency_krw')}{cycle.totalInvestedKrw?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td style={{
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                color: isPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                            }}>
                                                {isPositive ? '+' : ''}{t('currency_krw')}{cycle.profitKrw?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td style={{
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                color: isPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                            }}>
                                                {isPositive ? '+' : ''}{cycle.profitRate?.toFixed(2)}%
                                            </td>
                                            <td style={{
                                                textAlign: 'right',
                                                fontSize: '0.8rem',
                                                color: isPositive ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                                            }}>
                                                {isPositive ? '+' : ''}{cycle.roi?.toFixed(2)}%
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="modal-close"
                                                    style={{ fontSize: '1rem', padding: '10px', color: 'var(--calm-gray)' }}
                                                    onClick={() => {
                                                        triggerConfirm(t('deleteLog') + '?', () => onDelete(idx));
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: 'var(--calm-gray)' }}>
                                            {t('noOrders')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="desktop-hide">
                        {cycles.length > 0 ? cycles.map((cycle, idx) => {
                            const isPositive = cycle.profitKrw >= 0;
                            return (
                                <div key={idx} className={`cycle-card ${isPositive ? 'is-positive' : 'is-negative'}`}>
                                    <div className="cycle-card-header">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--calm-white)' }}>{cycle.ticker}</span>
                                                {cycle.isFailed && <span style={{ fontSize: '0.6rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', border: '1px solid rgba(239, 68, 68, 0.2)' }}>FAILED</span>}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--calm-gray)', opacity: 0.8 }}>{cycle.date} {cycle.endTime}</div>
                                        </div>
                                        <button
                                            className="modal-close"
                                            style={{ padding: '8px', fontSize: '1.2rem', color: 'var(--calm-gray)', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => triggerConfirm(t('deleteLog') + '?', () => onDelete(idx))}
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="cycle-card-grid">
                                        <div className="cycle-card-item">
                                            <span className="cycle-card-label">{t('summaryInvestment')}</span>
                                            <span className="cycle-card-val">{t('currency_krw')}{cycle.totalInvestedKrw?.toLocaleString()}</span>
                                        </div>
                                        <div className="cycle-card-item">
                                            <span className="cycle-card-label">{t('cycleDuration')}</span>
                                            <span className="cycle-card-val" style={{ color: 'var(--calm-white)' }}>{cycle.durationDays || '1'} {t('days')} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({cycle.turns}T)</span></span>
                                        </div>
                                        <div className="cycle-card-item highlight">
                                            <span className="cycle-card-label">{t('summaryProfitAmount')}</span>
                                            <span className="cycle-card-val" style={{ color: isPositive ? 'var(--neon-blue)' : 'var(--action-danger)', fontSize: '1.1rem' }}>
                                                {isPositive ? '+' : ''}{t('currency_krw')}{cycle.profitKrw?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="cycle-card-item highlight">
                                            <span className="cycle-card-label">ROE / ROI</span>
                                            <span className="cycle-card-val" style={{ color: isPositive ? 'var(--neon-blue)' : 'var(--action-danger)', fontSize: '1.1rem' }}>
                                                {isPositive ? '+' : ''}{cycle.profitRate?.toFixed(2)}% / {cycle.roi?.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'var(--calm-gray)', textAlign: 'center', fontWeight: '500' }}>
                                        {cycle.startDate} ~ {cycle.endDate}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--calm-gray)' }}>
                                {t('noOrders')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-save" onClick={onClose} style={{ padding: '12px 40px' }}>
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompletedCyclesModal;
