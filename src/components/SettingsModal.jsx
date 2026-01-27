import React, { useState } from 'react';

const SettingsModal = ({ isOpen, onClose, config, onSave, isLocked, t }) => {
    const [localConfig, setLocalConfig] = useState(config);

    const handleChange = (key, value) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content cockpit-modal" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{t('settingsTitle')}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px 30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Internal Label Helper */}
                        {(() => {
                            const LabelWithHelp = ({ label, helpKey, pos = 'center' }) => (
                                <label className={`help-label-custom pos-${pos}`} data-tooltip={t(helpKey)}>
                                    {label}
                                    <span className="info-icon">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    </span>
                                </label>
                            );

                            return (
                                <>
                                    {/* Group 1: Capital & Scale */}
                                    <div className="settings-group">
                                        <h4 className="body-subtitle" style={{ color: 'var(--action-buy)' }}>CAPITAL & SCALE</h4>
                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <LabelWithHelp label={t('targetTickerLabel')} helpKey="help_targetTicker" pos="left" />
                                                {isLocked && <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 800 }}>[LOCKED]</span>}
                                            </div>
                                            <select
                                                className="form-input"
                                                value={localConfig.targetTicker || 'TQQQ'}
                                                onChange={(e) => handleChange('targetTicker', e.target.value)}
                                                disabled={isLocked}
                                                style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                            >
                                                <option value="TQQQ">TQQQ</option>
                                                <option value="SOXL">SOXL</option>
                                                <option value="UPRO">UPRO</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('totalCapitalShort')} helpKey="help_totalCapital" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.totalCapital} onChange={(e) => handleChange('totalCapital', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('totalSlotsShort')} helpKey="help_totalSlots" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.totalSlots} onChange={(e) => handleChange('totalSlots', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('fxKrwUsd')} helpKey="help_fxKrwUsd" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.fxKrwUsd} onChange={(e) => handleChange('fxKrwUsd', Number(e.target.value))} />
                                        </div>
                                    </div>

                                    {/* Group 2: RSI Levels */}
                                    <div className="settings-group">
                                        <h4 className="body-subtitle" style={{ color: 'var(--calm-amber)' }}>RSI THRESHOLDS</h4>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('rsiOversoldShort')} helpKey="help_rsiOversold" pos="right" />
                                            <input type="number" className="form-input" value={localConfig.rsiOversold} onChange={(e) => handleChange('rsiOversold', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('rsiOverboughtShort')} helpKey="help_rsiOverbought" pos="right" />
                                            <input type="number" className="form-input" value={localConfig.rsiOverbought} onChange={(e) => handleChange('rsiOverbought', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('gapDropThreshold')} helpKey="help_gapDropThreshold" pos="right" />
                                            <input type="number" className="form-input" value={localConfig.gapDropThreshold} onChange={(e) => handleChange('gapDropThreshold', Number(e.target.value))} />
                                        </div>
                                    </div>

                                    {/* Group 3: Profit & Trail */}
                                    <div className="settings-group">
                                        <h4 className="body-subtitle" style={{ color: 'var(--action-buy)' }}>PROFIT & TRAILING</h4>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('tp1TriggerShort')} helpKey="help_tp1Trigger" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.tp1Trigger} onChange={(e) => handleChange('tp1Trigger', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('tp1RatioShort')} helpKey="help_tp1RatioShort" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.tp1SellRatio} onChange={(e) => handleChange('tp1SellRatio', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('trailStopShort')} helpKey="help_trailStop" pos="left" />
                                            <input type="number" className="form-input" value={localConfig.trailStop} onChange={(e) => handleChange('trailStop', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('buyPriceDropPct')} helpKey="help_buyPriceDropPct" pos="left" />
                                            <input type="number" step="0.1" className="form-input" value={localConfig.buyPriceDropPct || 0} onChange={(e) => handleChange('buyPriceDropPct', Number(e.target.value))} />
                                        </div>
                                    </div>

                                    {/* Group 4: Defense Mode */}
                                    <div className="settings-group">
                                        <h4 className="body-subtitle" style={{ color: 'var(--calm-amber)' }}>DEFENSE MODE</h4>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('defenseSlots')} helpKey="help_defenseSlots" pos="right" />
                                            <input type="number" className="form-input" value={localConfig.defenseSlotsThreshold} onChange={(e) => handleChange('defenseSlotsThreshold', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('defenseCash')} helpKey="help_defenseCash" pos="right" />
                                            <input type="number" className="form-input" value={localConfig.defenseCashThreshold} onChange={(e) => handleChange('defenseCashThreshold', Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <LabelWithHelp label={t('defenseFactor')} helpKey="help_defenseFactor" pos="right" />
                                            <input type="number" step="0.1" className="form-input" value={localConfig.defenseBuyFactor} onChange={(e) => handleChange('defenseBuyFactor', Number(e.target.value))} />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-save" onClick={() => onSave(localConfig)} style={{ padding: '12px 40px' }}>
                        {t('saveConfig')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
