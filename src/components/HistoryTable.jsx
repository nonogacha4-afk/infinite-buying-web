import React from 'react';

const HistoryTable = ({ data, t }) => {
    return (
        <div className="card glass-card history-card">
            <div className="card-header">
                <h3>{t('historyTitle')}</h3>
            </div>
            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>{t('dateHead')}</th>
                            <th>{t('closeHead')}</th>
                            <th>{t('changeHead')}</th>
                            <th style={{ textAlign: 'right' }}>{t('rsiHead')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx} className="history-row">
                                <td className="date-cell">{row.date}</td>
                                <td className="price-cell">${row.close.toFixed(2)}</td>
                                <td className={`change-cell ${row.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                    {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                                </td>
                                <td style={{ textAlign: 'right' }} className="rsi-cell">
                                    <span className={row.rsi > 70 ? 'text-neon-red' : row.rsi < 30 ? 'text-neon-green' : ''}>
                                        {row.rsi.toFixed(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;
