import React from 'react';

const DecisionCard = (props) => {
    const { status, currentMode, multiplier, amount, price, onExecute, onReset, onUndo, onViewHistory, t, fx, orderQty } = props;

    const getStatusClass = () => {
        if (status === 'SIGNAL_ON' || status === 'TRIGGERED') return 'text-buy';
        if (status === 'SELL') return 'text-sell';
        if (status === 'SOUL_ESCAPE') return 'text-soul';
        if (status === 'COMPLETED') return 'text-completed';
        if (status === 'FAILED') return 'text-sell';
        return 'text-wait';
    };

    const getStatusText = () => {
        if (status === 'TRIGGERED') return 'DEFENSE';
        if (status === 'SIGNAL_ON') return 'BUY';
        if (status === 'SELL') return 'SELL';
        if (status === 'SOUL_ESCAPE') return 'soul_escape';
        if (status === 'COMPLETED') return 'completed';
        if (status === 'FAILED') return 'FAILED';
        return 'WAIT';
    };

    const usePrice = props.overridePrice > 0 ? props.overridePrice : price;
    const targetBudgetKrw = amount;

    const isBuySignal = status === 'SIGNAL_ON' || status === 'TRIGGERED';
    const autoQty = (status === 'SELL' || status === 'SOUL_ESCAPE')
        ? orderQty
        : (isBuySignal && usePrice > 0 ? Math.max(1, Math.floor((targetBudgetKrw || 0) / (fx || 1) / usePrice)) : 0);

    const displayQty = props.overrideQty > 0 ? props.overrideQty : autoQty;
    const finalAmountKrw = displayQty * usePrice * fx;

    const handlePriceChange = (val) => {
        props.setOverridePrice(val);
        props.setOverrideQty(0);
    };

    const handleQtyChange = (val) => {
        props.setOverrideQty(val);
    };

    const isLackingCapital = isBuySignal && finalAmountKrw > props.capitalRemaining;
    const isWait = status === 'WAIT';
    const isExecutionDisabled = isWait || isLackingCapital;

    return (
        <section className="zone-a">
            <div className={`decision-card ${status === 'SOUL_ESCAPE' ? 'is-soul-mode' : ''} ${isLackingCapital ? 'is-locked-capital' : ''}`}>
                <div className="meta-control-group">
                    <button
                        className={`btn-refresh-data help-label-custom pos-center ${props.isRefreshing ? 'spinning' : ''} ${props.refreshSuccess ? 'success' : ''}`}
                        onClick={props.onRefresh}
                        data-tooltip={props.isRefreshing ? t('refreshing') : (props.refreshSuccess ? t('refresh_success') : t('refresh_tooltip'))}
                        disabled={props.isRefreshing}
                    >
                        {props.refreshSuccess ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                        )}
                    </button>

                    {props.lastUpdated && (
                        <div className="last-updated-display">
                            LAST UPDATED - {props.lastUpdated.toLocaleString(undefined, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                            <span style={{ marginLeft: '12px', opacity: 0.8 }}>
                                USD/KRW - {t('currency_krw')}{(props.fx || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <h3 className="decision-title">{t('todayAction')}</h3>
                    <h2 className={`primary-action ${getStatusClass()}`}>
                        {t(getStatusText().toLowerCase()).toUpperCase()}
                    </h2>

                    {(status === 'SIGNAL_ON' || status === 'TRIGGERED' || status === 'SELL' || status === 'SOUL_ESCAPE' || status === 'FAILED') && (
                        <div className="supporting-values" style={{ gap: 'var(--p2)', marginTop: 'var(--p2)' }}>
                            <div className="support-item">
                                <span className="support-label">{t('multiplier')}</span>
                                <span className="support-val" style={{ color: 'var(--calm-white)' }}>x{multiplier || '1.0'}</span>
                            </div>
                            <div className="support-item">
                                <span className="support-label">{t('orderPriceInput')}</span>
                                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--calm-gray)' }}>$</span>
                                    <input
                                        type="number"
                                        className="price-override-input"
                                        style={{ border: 'none', fontSize: '1.6rem', width: '120px' }}
                                        value={props.overridePrice > 0 ? props.overridePrice : (price?.toFixed(2) || '')}
                                        onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="support-item">
                                <span className="support-label">{t('orderQtyCalc')}</span>
                                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                                    <input
                                        type="number"
                                        className="price-override-input"
                                        style={{ border: 'none', fontSize: '1.6rem', width: '90px', paddingRight: '4px' }}
                                        value={props.overrideQty > 0 ? props.overrideQty : autoQty}
                                        onChange={(e) => handleQtyChange(parseInt(e.target.value) || 0)}
                                    />
                                    <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--calm-gray)' }}>{t('unit_shares')}</span>
                                </div>
                            </div>
                            <div className="support-item">
                                <span className="support-label">{t('amount')}</span>
                                <span className="support-val" style={{
                                    fontSize: '1.6rem',
                                    color: isLackingCapital ? 'var(--action-danger)' : 'var(--calm-white)',
                                    fontWeight: '900'
                                }}>
                                    {t('currency_krw')}{(finalAmountKrw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        display: 'block',
                                        textAlign: 'right',
                                        opacity: 0.5,
                                        marginTop: '4px',
                                        fontWeight: '500',
                                        color: 'var(--calm-gray)'
                                    }}>
                                        ({t('currency_krw')}{(props.fx || 0).toLocaleString()})
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}

                    {isLackingCapital && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--action-danger)', fontWeight: '700' }}>
                                {t('insufficient_capital')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="right-column-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '320px' }}>
                    <div className="action-button-group" style={{ width: '100%' }}>
                        <div
                            className={`premium-mode-badge help-label-custom pos-center ${status === 'SOUL_ESCAPE' ? 'is-soul' : (currentMode === 'DEFENSE' ? 'is-defense' : 'is-normal')}`}
                            data-tooltip={status === 'SOUL_ESCAPE' ? t('soul_escape_help') : (currentMode === 'DEFENSE' ? t('defense_active_help') : t('standard_protocol_help'))}
                        >
                            <div className="badge-glow"></div>
                            <div className="badge-content">
                                <span className="badge-label">PROTOCOL</span>
                                <span className="badge-val">{status === 'SOUL_ESCAPE' ? 'SOUL RELOAD' : (currentMode === 'DEFENSE' ? 'DEFENSE ACTIVE' : 'STANDARD')}</span>
                            </div>
                        </div>

                        <button
                            className={`btn-primary-action fire help-label-custom pos-center ${(isExecutionDisabled && status !== 'FAILED' && !isLackingCapital) ? 'disabled' : ''} ${status === 'SOUL_ESCAPE' ? 'soul-escape' : ''} ${status === 'FAILED' || isLackingCapital ? 'is-failed' : ''}`}
                            onClick={status === 'COMPLETED' || status === 'FAILED' || isLackingCapital ? onReset : (!isExecutionDisabled ? onExecute : null)}
                            disabled={isWait}
                            data-tooltip={status === 'FAILED' || isLackingCapital ? t('lacking_capital_warn') : (status === 'COMPLETED' ? t('completed_success') : t('execute_tooltip'))}
                            style={{
                                height: '80px',
                                borderRadius: '16px',
                                background: status === 'FAILED' || isLackingCapital ? 'rgba(239, 68, 68, 0.15)' : undefined,
                                border: status === 'FAILED' || isLackingCapital ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                color: status === 'FAILED' || isLackingCapital ? 'var(--action-danger)' : 'white',
                                marginTop: '12px'
                            }}
                        >
                            {status === 'FAILED' || isLackingCapital ? (status === 'FAILED' ? 'ABORT CYCLE' : 'INSUFFICIENT CAPITAL') : (
                                isWait ? t('wait') :
                                    status === 'COMPLETED' ? t('completed') : t('executeBtn')
                            )}
                        </button>

                        <div className="utility-actions-row" style={{ gap: '12px', marginTop: '12px' }}>
                            <button className="btn-secondary-reset undo help-label-custom pos-center" style={{ borderRadius: '12px' }} onClick={onUndo} data-tooltip={t('undo_tooltip')}>
                                {t('undoBtn')}
                            </button>
                            <button className="btn-secondary-reset help-label-custom pos-center" style={{ borderRadius: '12px' }} onClick={onReset} data-tooltip={t('reset_tooltip')}>
                                {t('resetBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DecisionCard;
