import React from 'react';

const Header = ({ language, setLanguage, ticker, setTicker, isLocked, onFetch, onSettings, onViewHistory, t }) => {
    return (
        <header className="top-bar glass">
            <div className="top-bar-left">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <span className="brand-accent" style={{ lineHeight: '1', marginBottom: '4px' }}>LAO</span>
                    <div className="header-creator-badge" style={{ padding: '2px 6px', marginLeft: '-2px' }}>
                        <span className="creator-mark-animated" style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>CHART FINDER X ANTIGRAVITY</span>
                    </div>
                </div>
                <div className="mobile-hide" style={{ height: '32px', width: '1px', background: 'var(--border-light)', margin: '0 16px', opacity: 0.5 }}></div>
                <div className="brand-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--calm-white)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>무한매매기법</span>
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            background: 'var(--action-buy)',
                            color: 'white',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.05em'
                        }}>V2.6.1</span>
                    </div>
                    <span className="brand-subtitle mobile-hide" style={{ fontSize: '0.55rem', opacity: 0.7 }}>INFINITE BUYING SYSTEM</span>
                </div>
            </div>

            <div className="top-bar-center mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--calm-gray)', fontWeight: '600', letterSpacing: '0.05em' }}>
                MECHANICAL STRATEGY DASHBOARD
            </div>

            <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="header-search-group" style={{ gap: '16px', display: 'flex', alignItems: 'center' }}>
                    <div className={`ticker-selector-wrapper help-label-custom pos-bottom ${isLocked ? 'is-locked' : ''}`} data-tooltip={isLocked ? t('isLockedTooltip') : '종목 선택'}>
                        <select
                            className="ticker-selector"
                            style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-glass)', fontSize: '0.9rem' }}
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            disabled={isLocked}
                        >
                            <option value="TQQQ">TQQQ</option>
                            <option value="SOXL">SOXL</option>
                            <option value="UPRO">UPRO</option>
                        </select>
                    </div>

                    <button
                        className="btn-fetch"
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            background: 'var(--muted-blue)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                        onClick={() => onFetch()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <span style={{ fontWeight: '800', letterSpacing: '0.05em' }}>{t('fetchBtn').toUpperCase()}</span>
                    </button>
                </div>

                <div className="header-util-group" style={{ gap: '12px', marginLeft: '12px' }}>
                    <button
                        className="btn-icon-settings help-label-custom pos-bottom"
                        onClick={() => onViewHistory()}
                        data-tooltip={t('fullHistory')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    <button
                        className="btn-icon-settings help-label-custom pos-bottom"
                        onClick={() => onSettings()}
                        data-tooltip={t('settingsTitle')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>

                    <button
                        className="btn-lang-toggle help-label-custom pos-bottom"
                        style={{ height: '34px', minWidth: '42px', borderRadius: '8px' }}
                        onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                        data-tooltip={language === 'ko' ? 'Switch to English' : '한국어로 변경'}
                    >
                        {language === 'ko' ? 'EN' : 'KO'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
