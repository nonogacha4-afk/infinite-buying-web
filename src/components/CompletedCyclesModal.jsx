import React from 'react';

const CompletedCyclesModal = ({ isOpen, onClose, cycles, onDelete, triggerConfirm, t }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal" style={{ maxWidth: '1000px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{t('cycleHistoryTitle')}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body" style={{ maxHeight: '700px', overflowY: 'auto' }}>

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

                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>{t('ticker')} / {t('cycleDate')}</th>
                                <th style={{ textAlign: 'center' }}>{t('cycleStartDate')} ~ {t('cycleEndDate')}</th>
                                <th style={{ textAlign: 'center' }}>{t('cycleDuration')}</th>
                                <th style={{ textAlign: 'right' }}>{t('turn')}</th>
                                <th style={{ textAlign: 'right' }}>{t('summaryInvestment')}</th>
                                <th style={{ textAlign: 'right' }}>{t('summaryProfitAmount')}</th>
                                <th style={{ textAlign: 'right' }}>{t('summaryProfitRate')}</th>
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
                                            ??cycle.totalInvestedKrw?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: '700',
                                            color: isPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                        }}>
                                            {isPositive ? '+' : ''}??cycle.profitKrw?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: '700',
                                            color: isPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                        }}>
                                            {isPositive ? '+' : ''}{cycle.profitRate?.toFixed(2)}%
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
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--calm-gray)' }}>
                                        {t('noOrders')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
