import React, { useState } from 'react';

const StrategyState = ({
    ticker, turn, maxTurns, slotsUsed, avgPrice, capitalRemaining, exposure, mdd,
    fx, triggerPct, totalCapital, defenseMode, currentPrice, nextSlotAmount, t
}) => {
    const [expanded, setExpanded] = useState(false);

    const pnl = (avgPrice > 0 && currentPrice > 0) ? (((currentPrice - avgPrice) / avgPrice) * 100) : 0;
    const isPositive = pnl >= 0;

    return (
        <div className="state-panel">
            <div className="insight-title">{t('strategyStatus')}</div>

            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_ticker')}>{t('ticker')}</span>
                <span className="state-val">{ticker}</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_turn')}>{t('turn')}</span>
                <span className="state-val">{turn} / {maxTurns}</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_avgPrice')}>{t('avgPrice')}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className="state-val">${avgPrice?.toFixed(2)}</span>
                    {avgPrice > 0 && (
                        <span style={{
                            fontSize: '0.8rem',
                            color: isPositive ? 'var(--action-buy)' : 'var(--action-sell)',
                            fontWeight: '700'
                        }}>
                            {isPositive ? '+' : ''}{pnl.toFixed(2)}%
                        </span>
                    )}
                </div>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_remainingCapital')}>{t('remainingCapital')}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className="state-val">{t('currency_krw')}{capitalRemaining?.toLocaleString()}</span>
                    {nextSlotAmount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--action-buy)', fontWeight: '600', marginTop: '2px' }}>
                            Next: {t('currency_krw')}{nextSlotAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    )}
                </div>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_exposure')}>{t('exposure')}</span>
                <span className="state-val">{exposure?.toFixed(1)}%</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_mdd')}>{t('mdd')}</span>
                <span className="state-val" style={{ color: 'var(--action-sell)' }}>{(mdd || 0).toFixed(1)}%</span>
            </div>

            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_fxRate')}>{t('fxRate')}</span>
                <span className="state-val">{fx?.toFixed(2)}</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_triggerPct')}>{t('triggerPct')}</span>
                <span className="state-val">{triggerPct}%</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_maxTurnsLabel')}>{t('maxTurnsLabel')}</span>
                <span className="state-val">{maxTurns}</span>
            </div>
            <div className="state-row">
                <span className="state-label help-label-custom pos-left" data-tooltip={t('help_defenseMode')}>{t('defenseMode')}</span>
                <span className="state-val">{defenseMode ? t('go') : t('wait')}</span>
            </div>
        </div>
    );
};

export default StrategyState;
