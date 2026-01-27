import React from 'react';
import AmmoMagazine from './AmmoMagazine';

const StatusDashboard = ({ turn, maxTurns, metrics, t }) => {
    return (
        <div className="sidebar-status-box">
            {/* Ammo Magazine Visualization - Keep as a core visual indicator of state */}
            <AmmoMagazine
                currentTurn={turn}
                maxTurns={maxTurns}
                slotAmount={metrics.slotAmount}
                t={t}
            />

            {/* Risk Metrics - Moved to advanced/compact status view */}
            <div className="sidebar-metrics-row">
                <div className="side-metric">
                    <span className="side-metric-label">MDD</span>
                    <span className="side-metric-val">{metrics.mdd}%</span>
                </div>
                <div className="side-metric">
                    <span className="side-metric-label">EXP</span>
                    <span className="side-metric-val">{metrics.currentExposure.toFixed(1)}%</span>
                </div>
                <div className="side-metric">
                    <span className="side-metric-label">VOL</span>
                    <span className="side-metric-val">{metrics.volatilityDrag}%</span>
                </div>
            </div>

            {metrics.isDefense && (
                <div className="defense-survival-mode">
                    <span className="blink-dot"></span>
                    SURVIVAL MODE ACTIVE
                </div>
            )}
        </div>
    );
};

export default StatusDashboard;
