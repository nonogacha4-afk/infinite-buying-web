import React from 'react';

const MobileNav = ({ activeTab, setActiveTab, t }) => {
    const tabs = [
        { id: 'TRADING', label: t('navTrading') || 'TRADING', icon: '?? },
        { id: 'CHART', label: t('navChart') || 'CHART', icon: '?뱢' },
        { id: 'HISTORY', label: t('navHistory') || 'HISTORY', icon: '?뱥' }
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
