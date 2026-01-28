import React, { useState } from 'react';
import { RotateCcw, BarChart3, Settings2, Wallet, TrendingUp, BarChart, Hash, Search, ChevronDown, ChevronUp } from 'lucide-react';

const ControlPanel = ({
    ticker, setTicker,
    turn, setTurn,
    maxTurns, setMaxTurns,
    rsi, setRsi,
    capital, setCapital,
    avgPrice, setAvgPrice,
    currentPrice, setCurrentPrice,
    prevClose, setPrevClose,
    fx, setFx,
    triggerPct, setTriggerPct,
    onFetch,
    t
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNumberInput = (setter, value, min, max) => {
        let val = parseFloat(value);
        if (isNaN(val)) val = 0;
        if (min !== undefined && val < min) val = min;
        setter(val);
    };

    return (
        <div className="card glass-card zone-state-card">
            <div className="card-header">
                <h3>SYSTEM STATE</h3>
                <div className="ticker-badge-box">
                    <input
                        type="text" value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        className="sidebar-ticker-input"
                    />
                    <button className="btn-sidebar-fetch" onClick={onFetch}>
                        <Search size={14} />
                    </button>
                </div>
            </div>

            <div className="state-summary-list">
                <div className="state-row">
                    <span className="state-label">Turn:</span>
                    <span className="state-val">{turn} / {maxTurns}</span>
                </div>
                <div className="state-row">
                    <span className="state-label">Avg Price:</span>
                    <span className="state-val">${avgPrice.toFixed(2)}</span>
                </div>
                <div className="state-row">
                    <span className="state-label">Capital:</span>
                    <span className="state-val">??capital.toLocaleString()}</span>
                </div>

                <div className="sidebar-control-row">
                    <input
                        type="range" min="0" max={maxTurns} value={turn}
                        onChange={(e) => setTurn(parseInt(e.target.value))}
                        className="neon-range mini"
                    />
                    <input
                        type="number" value={turn}
                        onChange={(e) => setTurn(parseInt(e.target.value) || 0)}
                        className="spin-input mini"
                    />
                </div>
            </div>

            <button className="btn-advanced-toggle" onClick={() => setIsExpanded(!isExpanded)}>
                <span>ADVANCED</span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
                <div className="advanced-settings-panel">
                    <div className="adv-input-group">
                        <label>Max Turns</label>
                        <input type="number" value={maxTurns} onChange={(e) => setMaxTurns(parseInt(e.target.value) || 1)} className="adv-input" />
                    </div>
                    <div className="adv-input-group">
                        <label>Trigger %</label>
                        <input type="number" value={triggerPct} onChange={(e) => setTriggerPct(parseFloat(e.target.value) || 0)} className="adv-input" />
                    </div>
                    <div className="adv-input-group">
                        <label>FX (Ratio)</label>
                        <input type="number" value={fx} onChange={(e) => setFx(parseFloat(e.target.value) || 0)} className="adv-input" />
                    </div>
                    <div className="adv-input-group">
                        <label>Current RSI</label>
                        <input type="number" value={rsi} onChange={(e) => setRsi(parseInt(e.target.value) || 0)} className="adv-input" />
                    </div>
                    <div className="adv-input-group">
                        <label>Prev Close</label>
                        <input type="number" value={prevClose} onChange={(e) => setPrevClose(parseFloat(e.target.value) || 0)} className="adv-input" />
                    </div>
                </div>
            )}

            <div className="sidebar-footer-actions">
                <button className="btn-sidebar-reset" onClick={() => setTurn(0)}>
                    <RotateCcw size={14} /> RESET
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;
