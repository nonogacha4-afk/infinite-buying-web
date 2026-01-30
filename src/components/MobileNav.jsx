import React from 'react';
import { TrendingUp, BarChart3, History } from 'lucide-react';

const MobileNav = ({ activeTab, setActiveTab, t }) => {
    const tabs = [
        { id: 'TRADING', label: t('navTrading') || 'TRADING', icon: <TrendingUp size={20} /> },
        { id: 'HISTORY', label: t('navHistory') || 'HISTORY', icon: <History size={20} /> }
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

