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

    // Dynamic Logic:
    // Slot Budget (KRW) is fixed per turn = (Amount passed from App / Old Price) * Old Price?
    // Actually, App passes calculated 'amount' (KRW) based on 'orderQty' * 'price'.
    // If user changes price, we want to maintain the same 'Slot Budget' (KRW investment amount).
    // So: New Qty = (Original Amount KRW / FX) / New Price USD.

    const usePrice = props.overridePrice > 0 ? props.overridePrice : price;
    const targetBudgetKrw = amount; // This is the scheduled investment amount from App

    // Auto Quantity based on Budget & Price (for BUY) or Fixed Qty (for SELL/SOUL_ESCAPE)
    const isBuySignal = status === 'SIGNAL_ON' || status === 'TRIGGERED';
    const autoQty = (status === 'SELL' || status === 'SOUL_ESCAPE')
        ? orderQty
        : (isBuySignal && usePrice > 0 ? Math.max(1, Math.floor((targetBudgetKrw || 0) / (fx || 1) / usePrice)) : 0);

    // Final Qty to use/display
    const displayQty = props.overrideQty > 0 ? props.overrideQty : autoQty;

    // Buying result
    const finalAmountKrw = displayQty * usePrice * fx;

    const handlePriceChange = (val) => {
        props.setOverridePrice(val);
        props.setOverrideQty(0); // Reset manual Qty to allow auto-calc based on new price
    };

    const handleQtyChange = (val) => {
        // If user manually sets Qty, we use that.
        // It overrides the auto-calc.
        props.setOverrideQty(val);
    };

    const isLackingCapital = isBuySignal && finalAmountKrw > props.capitalRemaining;
    const isWait = status === 'WAIT';
    const isExecutionDisabled = isWait || isLackingCapital;

    return (
        <section className="zone-a">
            <div className={`decision-card ${status === 'SOUL_ESCAPE' ? 'is-soul-mode' : ''} ${isLackingCapital ? 'is-locked-capital' : ''}`}>
                {/* Meta Control Group (Top-Left) */}
                <div className="meta-control-group">
                    <button
                        className={`btn-refresh-data help-label-custom pos-center ${props.isRefreshing ? 'spinning' : ''} ${props.refreshSuccess ? 'success' : ''}`}
                        onClick={props.onRefresh}
                        data-tooltip={props.isRefreshing ? '媛깆떊 以?..' : (props.refreshSuccess ? '媛깆떊 ?꾨즺!' : '媛寃?諛??섏쑉 ?곗씠??媛깆떊')}
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
                            LAST UPDATED 쨌 {props.lastUpdated.toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                            <span style={{ marginLeft: '12px', opacity: 0.8 }}>
                                USD/KRW 쨌 ??(props.fx || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                    <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--calm-gray)' }}>媛?/span>
                                </div>
                            </div>
                            <div className="support-item">
                                <span className="support-label">{t('amount')}</span>
                                <span className="support-val" style={{
                                    fontSize: '1.6rem',
                                    color: isLackingCapital ? 'var(--action-danger)' : 'var(--calm-white)',
                                    fontWeight: '900'
                                }}>
                                    ??(finalAmountKrw || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        display: 'block',
                                        textAlign: 'right',
                                        opacity: 0.5,
                                        marginTop: '4px',
                                        fontWeight: '500',
                                        color: 'var(--calm-gray)'
                                    }}>
                                        (?곸슜 ?섏쑉: ??(props.fx || 0).toLocaleString()})
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}

                    {isLackingCapital && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--action-danger)', fontWeight: '700' }}>
                                ?좑툘 ?붿뿬 ?먮낯 遺議?(遺議? ??(finalAmountKrw - props.capitalRemaining).toLocaleString()})
                            </p>
                        </div>
                    )}
                </div>

                <div className="right-column-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '320px' }}>

                    <div className="action-button-group" style={{ width: '100%' }}>
                        <div className="primary-actions-row">
                            <div
                                className={`premium-mode-badge help-label-custom pos-center ${status === 'SOUL_ESCAPE' ? 'is-soul' : (currentMode === 'DEFENSE' ? 'is-defense' : 'is-normal')}`}
                                data-tooltip={
                                    status === 'SOUL_ESCAPE'
                                        ? `[?곹샎?덉텧 吏꾪뻾 以?\n留ㅼ닔 以묐떒 諛??먭툑 ?뚯닔 留ㅻ룄 ?④퀎?낅땲??\n\n???됰룞: ?됰떒媛 遺洹?25%??遺꾪븷 留ㅻ룄\n??紐⑺몴: ?꾩껜 ?ъ씠??醫낅즺 諛?珥덇린??
                                        : currentMode === 'DEFENSE'
                                            ? `[諛⑹뼱 紐⑤뱶 ?쒖꽦]\n由ъ뒪??愿由щ? ?꾪빐 留ㅼ닔 媛뺣룄瑜???땅?덈떎.\n\n???ъ쑀: ${props.metrics?.defenseReason || '議곌굔 異⑹”'}\n???몄텧?? ${(props.exposure || 0).toFixed(1)}% ?몄텧 以?
                                            : `[?쒖? ?꾨왂 媛??\n${props.turn}/${props.totalSlots} ?뚯감 吏꾪뻾 以?(?뺤긽 踰붿쐞)\n\n[諛⑹뼱紐⑤뱶 吏꾩엯議곌굔: ${props.metrics?.defenseConditions?.entryConditionsMetCount || 0}/2 異⑹”]\n???щ’?꾪뿕(??{props.totalSlots - 8}??: ${props.metrics?.defenseConditions?.slotRisk ? '?? : '??}\n??媛?땐寃???4%): ${props.metrics?.defenseConditions?.gapShock ? '?? : '??}\n??怨쇰ℓ??RSI??0): ${props.metrics?.defenseConditions?.oversold ? '?? : '??}\n?????븯??MDD??12%): ${props.metrics?.defenseConditions?.deepDrawdown ? '?? : '??}`
                                }
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
                                data-tooltip={status === 'FAILED' || isLackingCapital ? '遺덈뒫 ?곹깭: 珥덇린?붽? ?꾩슂?섍굅???먮낯??遺議깊빀?덈떎.' : (status === 'COMPLETED' ? '?ъ씠???깃났 醫낅즺' : '?꾩옱 ?좏샇???곕씪 利됱떆 留ㅻℓ ?ㅽ뻾 諛?湲곕줉')}
                                style={{
                                    height: '80px',
                                    borderRadius: '16px',
                                    background: status === 'FAILED' || isLackingCapital ? 'rgba(239, 68, 68, 0.15)' : undefined,
                                    border: status === 'FAILED' || isLackingCapital ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                    color: status === 'FAILED' || isLackingCapital ? 'var(--action-danger)' : 'white'
                                }}
                            >
                                {status === 'FAILED' || isLackingCapital ? (status === 'FAILED' ? 'ABORT CYCLE' : 'INSUFFICIENT CAPITAL') : (
                                    isWait ? t('wait') :
                                        status === 'COMPLETED' ? t('completed') : t('executeBtn')
                                )}
                            </button>
                        </div>

                        <div className="utility-actions-row" style={{ gap: '12px' }}>
                            <button className="btn-secondary-reset undo help-label-custom pos-center" style={{ borderRadius: '12px' }} onClick={onUndo} data-tooltip="留덉?留?泥닿껐 湲곕줉 痍⑥냼 (Undo)">
                                {t('undoBtn')}
                            </button>
                            <button className="btn-secondary-reset help-label-custom pos-center" style={{ borderRadius: '12px' }} onClick={onReset} data-tooltip="?꾩껜 ?뚯감 諛?湲곕줉 珥덇린??(Reset)">
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
