import React from 'react';

const TradeLog = ({ logs, onDelete, onViewAll, currentPrice, avgPrice, fx, totalCapital, t }) => {
    // Calculate portfolio summary
    const buyLogs = logs.filter(l => l.side === 'BUY');
    const sellLogs = logs.filter(l => l.side === 'SELL');

    const totalBuyQty = buyLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
    const totalSellQty = sellLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
    const totalHolding = totalBuyQty - totalSellQty;

    const totalInvestedKrw = buyLogs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSoldKrw = sellLogs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Evaluation profit for current holdings
    const evaluationProfitKrw = totalHolding * (currentPrice - avgPrice) * (Number(fx) || 1400);

    // Realized profit from previous sells (approximate if we don't have historical avg)
    // But since logs are fresh, we can show total evaluation profit + realized if we had it.
    // For simplicity and matching screenshot:
    const totalNetProfitKrw = evaluationProfitKrw; // In a real app we'd add realized profit

    const profitRate = (Number(totalCapital) > 0)
        ? (totalNetProfitKrw / totalCapital) * 100
        : 0;

    const isProfitable = totalNetProfitKrw >= 0;

    return (
        <section className="zone-d">
            <div className="insight-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--p1)' }}>
                <span>{t('recentTradeLog')} ({logs.length})</span>
                {logs.length > 0 && (
                    <button className="btn-clear-logs help-label-custom pos-left" onClick={() => onDelete('all')} data-tooltip={t('clear_logs_tooltip')}>
                        {t('clearHistory')}
                    </button>
                )}
            </div>

            {/* Portfolio Summary - Premium Advanced UI */}
            {logs.length > 0 && (
                <div className="premium-metrics-bar">
                    <div className="metric-item">
                        <span className="metric-label">{t('total_invested')}</span>
                        <span className="metric-value" style={{ fontSize: '1.4rem' }}>
                            {t('currency_krw')}{totalInvestedKrw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">{t('total_holding_qty')}</span>
                        <span className="metric-value" style={{ color: 'var(--calm-white)', fontSize: '1.4rem' }}>
                            {totalHolding.toLocaleString()} {t('unit_shares')}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">{t('current_pnl')}</span>
                        <span className={`metric-value ${isProfitable ? 'positive' : 'negative'}`} style={{ fontSize: '1.4rem' }}>
                            {totalNetProfitKrw >= 0 ? '+' : '-'}{t('currency_krw')}{Math.abs(totalNetProfitKrw).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">{t('current_roi')}</span>
                        <span className={`metric-value ${isProfitable ? 'positive' : 'negative'}`} style={{ fontSize: '1.4rem' }}>
                            {profitRate >= 0 ? '+' : '-'}{(Math.abs(Number(profitRate)) || 0).toFixed(2)}%
                        </span>
                    </div>
                </div>
            )}

            <table className="log-table">
                <thead>
                    <tr>
                        <th>{t('time')}</th>
                        <th>{t('side')}</th>
                        <th>{t('quantity')}</th>
                        <th>{t('price')}</th>
                        <th>{t('log_amount')}</th>
                        <th style={{ textAlign: 'right' }}>{t('orderAction')}</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length > 0 ? logs.slice(0, 5).map((log, idx) => {
                        const amountKrw = Number(log.amount) || (Number(log.qty) * Number(log.price) * 1400);
                        return (
                            <tr key={idx}>
                                <td style={{ color: 'var(--calm-gray)', fontSize: '0.8rem' }}>{log.date}</td>
                                <td>
                                    {log.note && log.note.includes('Soul-Escape') ? (
                                        <span className="soul-badge">[SOUL]</span>
                                    ) : (
                                        <span style={{
                                            color: log.side === 'BUY' ? 'var(--action-buy)' : 'var(--action-sell)',
                                            fontWeight: '700',
                                            fontSize: '0.8rem'
                                        }}>
                                            {log.side === 'BUY' ? t('buyingTitle') : t('sellingTitle')}
                                        </span>
                                    )}
                                </td>
                                <td style={{ fontWeight: '600' }}>{Number(log.qty || 0).toLocaleString()} {t('unit_shares')}</td>
                                <td style={{ fontFamily: 'var(--font-display)' }}>${Number(log.price || 0).toFixed(2)}</td>
                                <td style={{ color: 'var(--calm-white)', fontWeight: '600' }}>
                                    {t('currency_krw')}{amountKrw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="modal-close help-label-custom pos-center"
                                        style={{ fontSize: '1.2rem', padding: '0 8px', color: 'var(--calm-gray)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-block' }}
                                        onClick={() => onDelete(idx)}
                                        data-tooltip={t('delete_log_tooltip')}
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--calm-gray)' }}>
                                {t('noOrders')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    className="btn-ghost"
                    onClick={onViewAll}
                >
                    {t('viewAllHistory')}
                </button>
            </div>
        </section>
    );
};

export default TradeLog;
