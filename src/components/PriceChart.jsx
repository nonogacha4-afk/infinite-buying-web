import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const PriceChart = ({ history, currentPrice, avgPrice, targetPct, ticker, t }) => {
    // Mode: Always Price on Left. Optional Profit on Right if avgPrice > 0.
    const hasAvg = avgPrice > 0;
    const chartRef = useRef(null);

    // Helper for bulletproof axis domains
    const getSafeDomain = (min, max, fallbackMin = 0, fallbackMax = 100) => {
        if (!isFinite(min) || !isFinite(max)) return [fallbackMin, fallbackMax];
        if (min === max) {
            const offset = Math.abs(min) * 0.05 || 1;
            return [min - offset, max + offset];
        }
        return [min, max];
    };

    // ZOOM STATE
    const [visibleCount, setVisibleCount] = useState(30);
    const [yZoomLevel, setYZoomLevel] = useState(0.05); // 5% padding by default

    // Prepare full dataset
    const fullData = useMemo(() => {
        if (!history || history.length === 0) return [];
        const data = [...history]
            .filter(h => h && h.date && h.close)
            .map(h => {
                const d = new Date(h.date);
                const dayName = isNaN(d.getTime())
                    ? '?'
                    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                const profit = hasAvg ? (((h.close - avgPrice) / avgPrice) * 100) : 0;
                const formattedDate = h.date && h.date.length >= 10 ? h.date.substring(5) : h.date;

                return {
                    date: dayName !== '?' ? `${formattedDate} (${dayName})` : (h.date || 'N/A'),
                    price: h.close,
                    profit: isFinite(profit) ? profit : 0,
                };
            });

        const currentPnl = hasAvg ? (((currentPrice - avgPrice) / avgPrice) * 100) : 0;
        if (currentPrice > 0) {
            data.push({
                date: `LIVE-${Date.now()}`, // Unique key
                displayDate: 'LIVE',
                price: currentPrice,
                profit: isFinite(currentPnl) ? currentPnl : 0,
                isLive: true
            });
        }
        return data;
    }, [history, currentPrice, avgPrice, hasAvg]);

    // Slice data for the visible window
    const chartData = useMemo(() => {
        if (fullData.length === 0) return [];
        const start = Math.max(0, fullData.length - visibleCount);
        return fullData.slice(start);
    }, [fullData, visibleCount]);

    useEffect(() => {
        const el = chartRef.current;
        if (!el) return;

        const onWheel = (e) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY;

            // AREA DETECTION:
            // Bottom 85px = X-Axis area
            // Left 55px or Right 55px = Y-Axis area
            const isXArea = mouseY > rect.height - 85;
            const isYArea = mouseX < 55 || mouseX > rect.width - 55;

            if (isYArea && !isXArea) {
                // ZOOM Y: Adjust Padding Level
                setYZoomLevel(prev => {
                    const step = Math.max(0.0001, prev * 0.2);
                    let next = delta > 0 ? prev + step : prev - step;
                    return Math.min(2.0, Math.max(0.001, next));
                });
            } else {
                // ZOOM X (Default): Adjust Visible Count
                const zoomStep = Math.max(1, Math.floor(visibleCount * 0.15));
                setVisibleCount(prev => {
                    let next = delta > 0 ? prev + zoomStep : prev - zoomStep;
                    return Math.min(fullData.length, Math.max(8, next));
                });
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [fullData.length, visibleCount]);

    const currentPnl = hasAvg ? (((currentPrice - avgPrice) / avgPrice) * 100) : 0;
    const isPositive = currentPnl >= 0;

    // Determine domains based on visible data
    const prices = chartData.map(d => d.price).filter(p => isFinite(p) && p > 0);
    if (hasAvg && isFinite(avgPrice) && avgPrice > 0) {
        prices.push(avgPrice);
        if (targetPct && isFinite(targetPct)) {
            const tPrice = avgPrice * (1 + targetPct / 100);
            if (isFinite(tPrice)) prices.push(tPrice);
        }
    }

    // Dynamic Padding Calculation for Y-Axis with Safety
    const rawMin = prices.length > 0 ? Math.min(...prices) : 0;
    const rawMax = prices.length > 0 ? Math.max(...prices) : 100;
    const priceRange = rawMax - rawMin;
    const safeZoom = isFinite(yZoomLevel) ? yZoomLevel : 0.05;
    const padding = priceRange * safeZoom;

    const [minPrice, maxPrice] = getSafeDomain(rawMin - padding, rawMax + padding, 0, 100);

    // Calculate Right Axis (Profit) Domain corresponding to Left Axis
    let [minProfit, maxProfit] = [0, 100];
    if (hasAvg && isFinite(avgPrice) && avgPrice > 0) {
        [minProfit, maxProfit] = getSafeDomain(
            ((minPrice - avgPrice) / avgPrice) * 100,
            ((maxPrice - avgPrice) / avgPrice) * 100,
            -10, 10
        );
    }

    // Target Price for ReferenceLine (Left Axis)
    const targetPrice = hasAvg && isFinite(targetPct) ? avgPrice * (1 + (targetPct / 100)) : 0;

    if (fullData.length === 0) {
        return (
            <div className="insight-panel chart-container-panel" style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--calm-gray)' }}>Waiting for market data...</span>
            </div>
        );
    }

    return (
        <div className="insight-panel chart-container-panel" style={{ height: '100%', minHeight: '380px' }}>
            <div className="insight-title chart-header-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{ticker} {hasAvg ? t('profitTrend') : t('priceTrend')}</span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--calm-white)', fontWeight: '700' }}>
                        ${(Number(currentPrice) || 0).toFixed(2)}
                    </span>
                </div>
                {hasAvg && (
                    <div className={`pnl-badge ${isPositive ? 'positive' : 'negative'}`}>
                        <span>{isPositive ? 'PROFIT' : 'LOSS'}</span>
                        <span>{isPositive ? '+' : ''}{(Number(currentPnl) || 0).toFixed(2)}%</span>
                    </div>
                )}
            </div>

            <div className="chart-focus-area" style={{ flex: 1, minHeight: '280px', cursor: 'ns-resize' }} ref={chartRef}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 45, left: 10, bottom: 85 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            angle={-90}
                            textAnchor="end"
                            interval={0}
                            height={85}
                            dy={15}
                            tickFormatter={(val) => (typeof val === 'string' && val.startsWith('LIVE-')) ? '' : val}
                        />
                        {/* LEFT AXIS: PRICE */}
                        <YAxis
                            yAxisId="left"
                            domain={[minPrice, maxPrice]}
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => (typeof val === 'number' && isFinite(val)) ? `$${val.toFixed(1)}` : ''}
                            width={45}
                        />
                        {/* RIGHT AXIS: PROFIT (Only if Avg exists) */}
                        {hasAvg && (
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[minProfit, maxProfit]}
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => (typeof val === 'number' && isFinite(val)) ? `${val.toFixed(1)}%` : ''}
                                width={45}
                            />
                        )}

                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    const profit = hasAvg && isFinite(avgPrice) && avgPrice > 0 ? (((data.price - avgPrice) / avgPrice) * 100) : 0;
                                    const isPos = profit >= 0;

                                    return (
                                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
                                            <div style={{ color: 'var(--calm-gray)', marginBottom: '4px' }}>{data.isLive ? 'Current Price' : data.date}</div>
                                            <div style={{ fontWeight: '700', color: 'var(--calm-white)' }}>Price: ${(Number(data.price) || 0).toFixed(2)}</div>
                                            {hasAvg && (
                                                <div style={{ fontWeight: '700', color: isPos ? 'var(--action-buy)' : 'var(--action-sell)', marginTop: '4px' }}>
                                                    Return: {isPos ? '+' : ''}{(Number(profit) || 0).toFixed(2)}%
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {hasAvg && isFinite(avgPrice) && avgPrice > 0 && (
                            <ReferenceLine
                                yAxisId="left"
                                y={avgPrice}
                                stroke="rgba(255, 255, 255, 0.5)"
                                strokeOpacity={0.8}
                                strokeDasharray="4 2"
                                strokeWidth={1}
                                label={{ position: 'insideBottomRight', value: `0% (Avg: $${(Number(avgPrice) || 0).toFixed(2)})`, fill: '#ffffff', fontSize: 10, fontWeight: 700, fillOpacity: 0.9 }}
                            />
                        )}

                        {hasAvg && isFinite(targetPrice) && targetPrice > 0 && (
                            <ReferenceLine
                                yAxisId="left"
                                y={targetPrice}
                                stroke="#10b981"
                                strokeDasharray="3 3"
                                strokeWidth={2}
                                label={{ position: 'insideTopRight', value: `TARGET (+${targetPct}%) $${(Number(targetPrice) || 0).toFixed(2)}`, fill: '#10b981', fontSize: 11, fontWeight: 900 }}
                            />
                        )}

                        {/* Profit Bar Chart (Right Axis) */}
                        {hasAvg && (
                            <Bar
                                yAxisId="right"
                                dataKey="profit"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        )}

                        {/* Monday Vertical Grid Lines */}
                        {chartData.map((d, idx) => {
                            if (d && d.date && typeof d.date === 'string' && d.date.includes('(Mon)')) {
                                return (
                                    <ReferenceLine
                                        yAxisId="left"
                                        key={`grid-${idx}`}
                                        x={d.date}
                                        stroke="rgba(255, 255, 255, 0.15)"
                                        strokeDasharray="3 3"
                                        strokeWidth={1}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Main Line: Price on Left Axis */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="price"
                            stroke="var(--action-buy)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'var(--action-buy)', strokeWidth: 2, stroke: 'var(--bg-dark)' }}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;
