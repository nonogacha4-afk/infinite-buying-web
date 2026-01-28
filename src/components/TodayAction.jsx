import React from 'react';
import { Target, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

const TodayAction = ({ signal, orders, rsi, prevClose, currentPrice, t }) => {
    // Determine the main action from signal
    const isBuy = signal.status === 'SIGNAL_ON' || signal.status === 'TRIGGERED';
    const mainOrder = orders.find(o => o.type.includes('BUY') || o.type.includes('START') || o.type.includes('AUTO'));

    // Calculate Gap Drop for the "Why" section
    const gapDrop = prevClose > 0 ? ((currentPrice - prevClose) / prevClose * 100).toFixed(1) : 0;
    const belowAvg = currentPrice < (mainOrder?.price || currentPrice); // Simplified

    return (
        <div className="action-container">
            {/* ZONE A: TODAY'S ACTION */}
            <div className="card action-primary-card">
                <div className="action-header">
                    <Target className="action-icon" size={24} />
                    <span className="action-label">TODAY'S ACTION</span>
                </div>

                <div className="action-main-content">
                    <div className="action-result">
                        <h2 className={isBuy ? 'text-action-buy' : 'text-action-wait'}>
                            {isBuy ? 'BUY' : 'WAIT'}
                        </h2>
                        {isBuy && (
                            <div className="action-details">
                                <div className="detail-item">
                                    <span className="detail-label">SIZE</span>
                                    <span className="detail-value">x{signal.multiplier || '1.0'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">PRICE/sh</span>
                                    <span className="detail-value">${currentPrice.toFixed(2)}</span>
                                </div>
                                <div className="detail-item highlighted">
                                    <span className="detail-label">AMOUNT</span>
                                    <span className="detail-value">{t('currency_krw')}{(mainOrder?.quantity * currentPrice * 1465 / currentPrice).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {!isBuy && (
                        <p className="wait-reason">{signal.message}</p>
                    )}
                </div>
            </div>

            {/* ZONE B: WHY THIS ACTION? */}
            <div className="card action-why-card">
                <div className="why-header">
                    <Info size={18} />
                    <span>WHY THIS ACTION?</span>
                </div>
                <div className="why-grid">
                    <div className="why-item">
                        <span className="why-dot"></span>
                        <span className="why-label">RSI:</span>
                        <span className="why-value">{rsi} ({rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : 'NORMAL'})</span>
                    </div>
                    <div className="why-item">
                        <span className="why-dot"></span>
                        <span className="why-label">Gap Drop:</span>
                        <span className={`why-value ${gapDrop < -4 ? 'text-orange-msg' : ''}`}>{gapDrop}%</span>
                    </div>
                    <div className="why-item">
                        <span className="why-dot"></span>
                        <span className="why-label">Below Avg:</span>
                        <span className="why-value">{belowAvg ? 'YES' : 'NO'}</span>
                    </div>
                    <div className="why-item">
                        <span className="why-dot"></span>
                        <span className="why-label">Trigger:</span>
                        <span className="why-value">{signal.status === 'TRIGGERED' ? 'HIT' : 'NOT HIT'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayAction;
