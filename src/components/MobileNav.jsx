import React from 'react';

const MobileNav = ({ activeTab, setActiveTab, t }) => {
    const tabs = [
        { id: 'TRADING', label: t('navTrading') || '매매전략', icon: '⚡' },
        { id: 'CHART', label: t('navChart') || '차트분석', icon: '📈' },
        { id: 'HISTORY', label: t('navHistory') || '전체기록', icon: '📋' }
    ];

    return (
        <nav className="mobile-nav glass">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default MobileNav;
