import React from 'react';

const WhySection = ({ rsi, gapDrop, belowAvg, triggerHit, defenseReason, currentPrice, avgPrice, profitRate, totalHoldings, t }) => {
    const getRsiState = (val) => {
        if (val < 30) return 'OVERSOLD';
        if (val > 70) return 'OVERBOUGHT';
        return 'NORMAL';
    };

    const getProfitColor = (rate) => {
        if (rate >= 0) return 'var(--action-buy)';
        return 'var(--action-sell)';
    };

    return (
        <section className="zone-b">
            <div className="why-grid">
                <div className="why-item">
                    <span className="why-label">?꾩옱媛</span>
                    <span className="why-val">${currentPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="why-item">
                    <span className="why-label">?됯퇏?④?</span>
                    <span className="why-val">${avgPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="why-item">
                    <span className="why-label">?섏씡瑜?/span>
                    <span className="why-val" style={{ color: getProfitColor(profitRate), fontWeight: '700' }}>
                        {profitRate >= 0 ? '+' : ''}{profitRate?.toFixed(2)}%
                    </span>
                </div>
                <div className="why-item">
                    <span className="why-label">?꾩옱 蹂댁쑀?섎웾</span>
                    <span className="why-val">{totalHoldings.toLocaleString()} sh</span>
                </div>
                <div className="why-item">
                    <span className="why-label">{t('rsiState')}</span>
                    <span className="why-val">{rsi?.toFixed(1)} ({getRsiState(rsi)})</span>
                </div>
                <div className="why-item">
                    <span className="why-label">{t('gapDrop')}</span>
                    <span className="why-val">{gapDrop}%</span>
                </div>
            </div>
            {defenseReason && (
                <div className="defense-reason-banner">
                    <span className="blink-dot"></span>
                    {defenseReason}
                </div>
            )}
        </section>
    );
};

export default WhySection;
