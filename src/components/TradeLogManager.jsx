import React from 'react';
import { Trash2, Save } from 'lucide-react';

const TradeLogManager = ({ logs, onAdd, onClear, t }) => {
    return (
        <div className="card glass-card trade-log-card">
            <div className="card-header">
                <h3>{t('tradeLogTitle')}</h3>
                <button className="btn-icon-danger" onClick={onClear}>
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="trade-log-container">
                <table className="trade-log-table">
                    <thead>
                        <tr>
                            <th>{t('logDate')}</th>
                            <th>{t('logPrice')}</th>
                            <th>{t('logQty')}</th>
                            <th>{t('logAmount')} (??</th>
                            <th style={{ textAlign: 'right' }}>{t('logFx')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? (
                            logs.map((log, idx) => (
                                <tr key={idx} className="log-row">
                                    <td className="date-cell">{log.date}</td>
                                    <td className="price-cell">${log.price.toFixed(2)}</td>
                                    <td className="qty-cell">{log.qty} sh</td>
                                    <td className="amount-cell">{log.amount.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }} className="fx-cell">{log.fx}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-log-msg">{t('noOrders')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeLogManager;
