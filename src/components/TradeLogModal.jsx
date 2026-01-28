import React from 'react';

const TradeLogModal = ({ isOpen, onClose, logs, onDelete, currentPrice, fx, triggerConfirm, t }) => {
    if (!isOpen) return null;

    // Summary Calculations
    const buys = logs.filter(l => l.side === 'BUY');
    const sells = logs.filter(l => l.side === 'SELL');

    const totalInvestedKrw = buys.reduce((acc, l) => acc + (l.amount || 0), 0);
    const totalSoldKrw = sells.reduce((acc, l) => acc + (l.amount || 0), 0);

    const totalBuyQty = buys.reduce((acc, l) => acc + (l.qty || 0), 0);
    const totalSellQty = sells.reduce((acc, l) => acc + (l.qty || 0), 0);
    const currentQty = totalBuyQty - totalSellQty;

    const currentValuationKrw = currentQty * currentPrice * fx;

    const totalProfitKrw = (totalSoldKrw + currentValuationKrw) - totalInvestedKrw;
    const profitRate = totalInvestedKrw > 0 ? (totalProfitKrw / totalInvestedKrw) * 100 : 0;
    const isProfitPositive = totalProfitKrw >= 0;

    return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{t('fullHistory')}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                    {/* Summary Dashboard */}
                    <div className="summary-dashboard">
                        <div className="summary-item">
                            <div className="summary-icon-wrapper">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                            </div>
                            <div className="summary-text-content">
                                <span className="support-label">{t('summaryInvestment')}</span>
                                <span className="support-val" style={{ fontSize: '1.6rem', color: 'var(--calm-white)' }}>
                                    ??totalInvestedKrw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon-wrapper" style={{ color: isProfitPositive ? 'var(--action-buy)' : 'var(--action-sell)' }}>
                                {isProfitPositive ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                        <polyline points="17 6 23 6 23 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                        <polyline points="17 18 23 18 23 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <div className="summary-text-content">
                                <span className="support-label">{t('summaryProfitAmount')}</span>
                                <span className={`support-val ${isProfitPositive ? 'positive-glow' : 'negative-glow'}`} style={{
                                    fontSize: '1.6rem',
                                    color: isProfitPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                }}>
                                    {isProfitPositive ? '+' : ''}??totalProfitKrw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon-wrapper" style={{ color: isProfitPositive ? 'var(--action-buy)' : 'var(--action-sell)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="6"></circle>
                                    <circle cx="12" cy="12" r="2"></circle>
                                </svg>
                            </div>
                            <div className="summary-text-content">
                                <span className="support-label">{t('summaryProfitRate')}</span>
                                <span className={`support-val ${isProfitPositive ? 'positive-glow' : 'negative-glow'}`} style={{
                                    fontSize: '1.6rem',
                                    color: isProfitPositive ? 'var(--action-buy)' : 'var(--action-sell)'
                                }}>
                                    {isProfitPositive ? '+' : ''}{profitRate.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="insight-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--calm-gray)' }}>{t('tradeLogTitle')} ({logs.length})</span>
                        {logs.length > 0 && (
                            <button
                                className="btn-clear-logs-premium"
                                onClick={() => {
                                    triggerConfirm(t('clearHistory') + '?', () => onDelete('all'));
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                {t('clearHistory')}
                            </button>
                        )}
                    </div>

                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>{t('time')}</th>
                                <th>{t('side')}</th>
                                <th>{t('quantity')}</th>
                                <th>{t('price')}</th>
                                <th>{t('logAmount')}</th>
                                <th style={{ textAlign: 'right' }}>{t('orderAction')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? logs.map((log, idx) => (
                                <tr key={idx}>
                                    <td style={{ color: 'var(--calm-gray)', fontSize: '0.8rem' }}>{log.date}</td>
                                    <td>
                                        <span style={{
                                            color: log.side === 'BUY' ? 'var(--action-buy)' : 'var(--action-sell)',
                                            fontWeight: '700',
                                            fontSize: '0.75rem'
                                        }}>
                                            {log.side === 'BUY' ? t('buyingTitle') : t('sellingTitle')}
                                        </span>
                                    </td>
                                    <td>{log.qty} 媛?/td>
                                    <td>${log.price?.toFixed(2)}</td>
                                    <td>??log.amount?.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="modal-close"
                                            style={{ fontSize: '1rem', padding: '0 4px', color: 'var(--calm-gray)' }}
                                            onClick={() => {
                                                triggerConfirm(t('deleteLog') + '?', () => onDelete(idx));
                                            }}
                                            title={t('deleteLog')}
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--calm-gray)' }}>
                                        {t('noOrders')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="modal-footer">
                    <button className="btn-save" onClick={onClose} style={{ padding: '10px 30px' }}>
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeLogModal;
