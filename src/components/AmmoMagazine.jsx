import React from 'react';

const AmmoMagazine = ({ config, currentTurn, investedCapital, capitalRemaining, slotAmount: propSlotAmount, tradeLogs = [], onRevive, t }) => {
    const { totalSlots: maxTurns, defenseSlotsThreshold: defenseSlots = 8, totalCapital } = config;
    const slotAmount = propSlotAmount || (totalCapital / maxTurns);

    // Total chambers based on maxTurns
    const slots = Array.from({ length: maxTurns }, (_, i) => i + 1);

    // Calculate Soul-Escape reload credits from trade logs
    const sells = tradeLogs || [];
    const soulEscapeSells = sells.filter(l => l.note && l.note.includes('Soul-Escape'));
    const reloadCredits = soulEscapeSells.length * Math.floor(maxTurns * 0.25);

    return (
        <div className="handgun-magazine-frame">
            <div className="magazine-status-header">
                <div className="magazine-label">
                    <span className="icon-mechanical"></span>
                    <h4>{t('magazineTitle')}</h4>
                </div>
                <div className="ammo-counter">
                    <span className="count-label" style={{ fontSize: '0.6rem', opacity: 0.5, marginRight: '8px' }}>
                        {t('remainingAmmo')}
                    </span>
                    <span className="count-active">{Math.max(0, maxTurns - currentTurn)}</span>
                    <span className="count-separator">/</span>
                    <span className="count-max">{maxTurns}</span>
                    {reloadCredits > 0 && (
                        <span className="reload-badge" style={{
                            marginLeft: '8px',
                            fontSize: '0.7rem',
                            color: '#a78bfa',
                            fontWeight: 'bold'
                        }}>
                            +{reloadCredits} 💜
                        </span>
                    )}
                </div>
            </div>

            <div className="ammo-magazine-case">
                <div className="magazine-inner-grid">
                    {slots.map((num) => {
                        const isSpent = num <= currentTurn;
                        const isDefenseBullet = num > (maxTurns - defenseSlots);

                        // Check if this bullet was reloaded by Soul-Escape
                        const isReloaded = num > currentTurn && num <= (currentTurn + reloadCredits) && reloadCredits > 0;

                        let statusClass = 'remaining';
                        if (isSpent) statusClass = 'spent-empty';
                        if (isDefenseBullet && !isSpent && !isReloaded) statusClass += ' is-defense';
                        if (isReloaded) statusClass = 'remaining is-soul-reload';

                        return (
                            <div
                                key={num}
                                className={`bullet-chamber ${statusClass} ${isSpent && num === currentTurn ? 'can-revive' : ''} help-label-custom pos-center`}
                                data-tooltip={
                                    isReloaded
                                        ? `💜 영혼탈출 재장전 (${num}번)`
                                        : isSpent && num === currentTurn
                                            ? t('reviveAmmo')
                                            : `${t('bulletTooltip')} ₩${slotAmount.toLocaleString()}`
                                }
                                onClick={isSpent && num === currentTurn ? onRevive : null}
                                style={{ cursor: isSpent && num === currentTurn ? 'pointer' : 'default' }}
                            >
                                <div className="bullet-visual">
                                    <div className="bullet-cap"></div>
                                    <div className="bullet-shell">
                                        <div className="shell-reflection"></div>
                                    </div>
                                </div>
                                <div className="chamber-number">{num}</div>
                                {isSpent && <div className="empty-hole"></div>}

                                {/* Label for current turn indicator */}
                                {num === currentTurn && (
                                    <div className="firing-indicator">LAST FIRED</div>
                                )}

                                {/* Label for reloaded bullets */}
                                {isReloaded && (
                                    <div className="soul-reload-badge">💜</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="magazine-footer-info">
                <div className="footer-metric">
                    <span className="footer-label">투입 금액</span>
                    <span className="footer-value">₩{Math.floor(investedCapital || 0).toLocaleString()}</span>
                </div>
                <div className="footer-metric">
                    <span className="footer-label">{t('remainingCapital')}</span>
                    <span className="footer-value">₩{Math.floor(capitalRemaining || 0).toLocaleString()}</span>
                </div>
            </div>
        </div >
    );
};

export default AmmoMagazine;
