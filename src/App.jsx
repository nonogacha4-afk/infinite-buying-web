import React, { useState, useEffect } from 'react';
import { calculateBuyingOrder, calculateSellingOrder, defaultStrategyConfig, calculateIndicators } from './utils/logic';
import { fetchExchangeRate } from './utils/fx';
import { getLastTradingDays } from './utils/date';
import { translations } from './utils/i18n';

// Components
import Header from './components/Header.jsx';
import DecisionCard from './components/DecisionCard.jsx';
import WhySection from './components/WhySection.jsx';
import PriceChart from './components/PriceChart.jsx';
import StrategyState from './components/StrategyState.jsx';
import TradeLog from './components/TradeLog.jsx';
import FetchResultModal from './components/FetchResultModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import TradeLogModal from './components/TradeLogModal.jsx';
import CompletedCyclesModal from './components/CompletedCyclesModal.jsx';
import AmmoMagazine from './components/AmmoMagazine.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import AccessCodeGuard from './components/AccessCodeGuard.jsx';
import MobileNav from './components/MobileNav.jsx';

function App() {
    // State
    const [language, setLanguage] = useState('ko');
    const [ticker, setTicker] = useState(() => {
        try {
            const saved = localStorage.getItem('strategyConfig');
            return saved ? JSON.parse(saved).targetTicker || 'TQQQ' : 'TQQQ';
        } catch (e) {
            return 'TQQQ';
        }
    });
    const [turn, setTurn] = useState(() => {
        try {
            const saved = localStorage.getItem('currentTurn');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    });
    const [currentPrice, setCurrentPrice] = useState(50.00);
    const [prevClose, setPrevClose] = useState(52.00);
    const [highPrice, setHighPrice] = useState(0);

    // Track Session High Price for Trailing Stop
    useEffect(() => {
        if (currentPrice > highPrice) {
            setHighPrice(currentPrice);
        }
    }, [currentPrice, highPrice]);
    const [rsi, setRsi] = useState(45);
    const [orders, setOrders] = useState([]);
    const [sellingOrders, setSellingOrders] = useState([]);

    // Mock History (Aligned with Market Days: Jan 16, 20, 21, 22, 23)
    const [history, setHistory] = useState([
        { date: '2026-01-16', close: 54.20, change: -1.0, rsi: 48.0 },
        { date: '2026-01-20', close: 52.10, change: -3.8, rsi: 42.1 },
        { date: '2026-01-21', close: 52.85, change: 1.4, rsi: 44.5 },
        { date: '2026-01-22', close: 53.60, change: 1.4, rsi: 46.8 },
        { date: '2026-01-23', close: 54.32, change: 1.3, rsi: 48.8 },
    ]);

    const [strategyConfig, setStrategyConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('strategyConfig');
            return saved ? JSON.parse(saved) : defaultStrategyConfig;
        } catch (e) {
            console.warn('Failed to parse strategyConfig:', e);
            return defaultStrategyConfig;
        }
    });

    const [tradeLogs, setTradeLogs] = useState(() => {
        try {
            const saved = localStorage.getItem('tradeLogs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Failed to parse tradeLogs:', e);
            return [];
        }
    });

    const [completedCycles, setCompletedCycles] = useState(() => {
        try {
            const saved = localStorage.getItem('completedCycles');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Failed to parse completedCycles:', e);
            return [];
        }
    });

    const [showFetchModal, setShowFetchModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showCycleHistoryModal, setShowCycleHistoryModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const [currentMode, setCurrentMode] = useState(() => {
        try {
            const saved = localStorage.getItem('currentMode');
            return saved || 'NORMAL';
        } catch (e) {
            return 'NORMAL';
        }
    });
    const [defenseCooldown, setDefenseCooldown] = useState(() => {
        try {
            const saved = localStorage.getItem('defenseCooldown');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    });

    const [metrics, setMetrics] = useState({ mdd: 0, volatilityDrag: 0, currentExposure: 0, slotAmount: 0, defenseReason: '' });
    const [signal, setSignal] = useState({ status: 'WAIT', message: '', multiplier: 1.0 });
    const [overridePrice, setOverridePrice] = useState(0); // User manual price override
    const [overrideQty, setOverrideQty] = useState(0); // User manual qty override
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null });
    const [refreshSuccess, setRefreshSuccess] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(() => {
        return localStorage.getItem('isAuthorized') === 'true';
    });

    // Mobile View State
    const [activeTab, setActiveTab] = useState('TRADING');
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobileViewport = viewportWidth < 768;

    // Translation helper
    const t = (key) => translations[language][key] || key;

    // Add missing translations for mobile nav
    if (language === 'ko') {
        translations.ko.navTrading = '留ㅻℓ?꾨왂';
        translations.ko.navChart = '李⑦듃遺꾩꽍';
        translations.ko.navHistory = '?꾩껜湲곕줉';
    } else {
        translations.en.navTrading = 'TRADING';
        translations.en.navChart = 'CHART';
        translations.en.navHistory = 'HISTORY';
    }

    const triggerConfirm = (message, callback) => {
        setConfirmState({
            isOpen: true,
            message,
            onConfirm: () => {
                callback();
                setConfirmState({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    // Save logs
    useEffect(() => {
        localStorage.setItem('tradeLogs', JSON.stringify(tradeLogs));
    }, [tradeLogs]);

    useEffect(() => {
        localStorage.setItem('strategyConfig', JSON.stringify(strategyConfig));
    }, [strategyConfig]);

    useEffect(() => {
        localStorage.setItem('tradeLogs', JSON.stringify(tradeLogs));
    }, [tradeLogs]);

    useEffect(() => {
        localStorage.setItem('completedCycles', JSON.stringify(completedCycles));
    }, [completedCycles]);

    useEffect(() => {
        localStorage.setItem('currentTurn', turn);
    }, [turn]);

    useEffect(() => {
        localStorage.setItem('currentMode', currentMode);
    }, [currentMode]);

    useEffect(() => {
        localStorage.setItem('defenseCooldown', defenseCooldown);
    }, [defenseCooldown]);

    // Auto-Calculate Avg Price based on Trade Logs
    useEffect(() => {
        try {
            const logs = Array.isArray(tradeLogs) ? tradeLogs : [];
            const buyLogs = logs.filter(l => l && l.side === 'BUY');
            const totalQty = buyLogs.reduce((acc, cur) => acc + (Number(cur.qty) || 0), 0);

            let newAvgPrice = 0;
            if (totalQty > 0) {
                const totalCostUsd = buyLogs.reduce((acc, cur) => acc + ((Number(cur.price) || 0) * (Number(cur.qty) || 0)), 0);
                newAvgPrice = totalCostUsd / totalQty;
            }

            if (isFinite(newAvgPrice)) {
                setStrategyConfig(prev => {
                    const currentAvg = Number(prev?.avgPrice) || 0;
                    if (Math.abs(currentAvg - newAvgPrice) > 0.001) {
                        return { ...prev, avgPrice: newAvgPrice };
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.error("Error in average price calculation:", e);
        }
    }, [tradeLogs]);

    // Calculate Logic
    useEffect(() => {
        try {
            const logs = Array.isArray(tradeLogs) ? tradeLogs : [];
            const buys = logs.filter(l => l && l.side === 'BUY');
            const sells = logs.filter(l => l && l.side === 'SELL');
            const totalSpentKrw = buys.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            const totalSoldKrw = sells.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            const actualUsedCapitalKrw = totalSpentKrw - totalSoldKrw;
            const actualRemainingCapitalKrw = Math.max(0, strategyConfig.totalCapital - actualUsedCapitalKrw);

            const result = calculateBuyingOrder(
                turn,
                strategyConfig || defaultStrategyConfig,
                strategyConfig.avgPrice || 0,
                currentPrice || 0,
                rsi || 50,
                prevClose || 0,
                highPrice || 0,
                currentMode || 'NORMAL',
                defenseCooldown || 0,
                actualRemainingCapitalKrw
            );

            if (result) {
                setOrders(result.orders || []);
                setSignal({
                    status: result.status || 'WAIT',
                    message: result.message || '',
                    multiplier: Number(result.multiplier) || 1.0
                });
                setMetrics(result.metrics || {});
                if (result.nextMode && result.nextMode !== currentMode) {
                    setCurrentMode(result.nextMode);
                }
            }

            const totalQty = logs.reduce((acc, curr) => (curr && curr.side === 'BUY') ? acc + (Number(curr.qty) || 0) : acc - (Number(curr.qty) || 0), 0);
            const hasPartialSell = logs.some(l => l && l.side === 'SELL');
            const sellResult = calculateSellingOrder(
                (strategyConfig && strategyConfig.avgPrice) || 0,
                totalQty,
                currentPrice || 0,
                highPrice || 0,
                strategyConfig || defaultStrategyConfig,
                hasPartialSell,
                turn,
                (strategyConfig && strategyConfig.totalSlots) || 20,
                actualRemainingCapitalKrw
            );
            setSellingOrders(sellResult || []);

            if (sellResult && sellResult.length > 0) {
                const newStatus = sellResult[0].type === 'SOUL_ESCAPE' ? 'SOUL_ESCAPE' : 'SELL';
                setSignal(prev => ({
                    ...prev,
                    status: newStatus,
                    message: sellResult[0].message
                }));
            } else if (totalQty <= 0 && logs.length > 0) {
                setSignal(prev => ({ ...prev, status: 'COMPLETED' }));
            }
        } catch (calcError) {
            console.error("Critical error in calculation useEffect:", calcError);
        }
    }, [turn, strategyConfig, currentPrice, rsi, prevClose, highPrice, tradeLogs, currentMode, defenseCooldown]);

    // Pseudo-random deterministic generator
    const getSeededRandom = (seed) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const generateMarketData = (targetTicker) => {
        // 1. Generate 40 Trading Days
        const tradingDays = getLastTradingDays(40);

        // 2. Stable Seed Data per Ticker
        const tickerConfig = {
            TQQQ: { base: 60.0, volatility: 0.025, baseRsi: 50, seedOffset: 100 },
            SOXL: { base: 45.0, volatility: 0.045, baseRsi: 48, seedOffset: 200 },
            UPRO: { base: 72.0, volatility: 0.015, baseRsi: 52, seedOffset: 300 }
        };
        const config = tickerConfig[targetTicker] || tickerConfig.TQQQ;

        // 3. Generate Deterministic 40 Day History
        let lastPrice = config.base;
        const generatedHistory = tradingDays.map((date, idx) => {
            const dateSeed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0) + config.seedOffset;
            const seededVal = getSeededRandom(dateSeed);
            const change = (seededVal - 0.48) * config.volatility * 100;

            lastPrice = lastPrice * (1 + (change / 100));
            const rsiSeededVal = getSeededRandom(dateSeed + idx + 7);
            const rsiVal = Math.max(20, Math.min(80, config.baseRsi + (rsiSeededVal - 0.5) * 20));

            return {
                date,
                close: parseFloat(lastPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                rsi: parseFloat(rsiVal.toFixed(1))
            };
        });

        return generatedHistory;
    };

    const loadData = async (targetTicker) => {
        try {
            // In Production (Vercel), we use relative paths /api/...
            // In Local, we use /api/... which proxies to localhost:3001
            const apiBase = '';
            const historyRes = await fetch(`${apiBase}/api/history?ticker=${targetTicker}`);
            if (!historyRes.ok) throw new Error(`History API failed: ${historyRes.status}`);
            const historyData = await historyRes.json();

            const quoteRes = await fetch(`${apiBase}/api/quote?ticker=${targetTicker}`);
            const quoteData = quoteRes.ok ? await quoteRes.json() : {};

            if (historyData && Array.isArray(historyData) && historyData.length > 0) {
                // Restore RSI Calculation for live data
                const processedHistory = calculateIndicators(historyData);

                const lastPoint = processedHistory[processedHistory.length - 1];
                const livePrice = Number(quoteData?.regularMarketPrice || quoteData?.price || lastPoint.close) || lastPoint.close;

                const livePoint = {
                    date: 'LIVE',
                    close: livePrice,
                    rsi: lastPoint.rsi // Last known RSI
                };

                const fullHistory = [...processedHistory, livePoint];

                setCurrentPrice(livePrice);
                setPrevClose(lastPoint.close);
                setHighPrice(prevHigh => Math.max(livePrice, lastPoint.close, prevHigh || 0));
                setRsi(livePoint.rsi);
                setHistory(fullHistory);
                setIsSimulationMode(false);
            } else {
                throw new Error('historyData is empty or invalid format');
            }
        } catch (error) {
            console.warn('API Error, falling back to Simulation Mode:', error.message);
            const generatedHistory = generateMarketData(targetTicker);
            setIsSimulationMode(true);

            if (generatedHistory && generatedHistory.length > 0) {
                const lastEOD = generatedHistory[generatedHistory.length - 1];
                setCurrentPrice(lastEOD.close);
                setPrevClose(generatedHistory.length > 1 ? generatedHistory[generatedHistory.length - 2].close : lastEOD.close);
                setHighPrice(prevHigh => Math.max(lastEOD.close, prevHigh || 0));
                setRsi(lastEOD.rsi);
                setHistory(generatedHistory);
            }
        }
        setLastUpdated(new Date());

        // Try FX separately in background (non-blocking for UI)
        fetchExchangeRate().then(newFx => {
            if (newFx) setStrategyConfig(prev => ({ ...prev, fxKrwUsd: newFx }));
        }).catch(e => console.warn('FX fetch failed', e));
    };

    // Initial Load
    useEffect(() => {
        loadData(ticker);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    const handleRefreshData = async () => {
        setIsRefreshing(true);
        await loadData(ticker);
        // Reset overrides when refreshing to latest market data
        setOverridePrice(0);
        setOverrideQty(0);
        setIsRefreshing(false);

        // Show success indicator for 2 seconds
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000);
    };

    const handleFetch = async () => {
        setIsLoadingData(true);
        setLoadingProgress(0);

        // Start simulated progress
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 90) return prev; // Hold at 90%
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 200);

        try {
            await loadData(ticker);
            setLoadingProgress(100);
            setTimeout(() => {
                setIsLoadingData(false);
                setShowFetchModal(true);
            }, 50); // Minimal delay for smoother feeling
        } catch (e) {
            console.error("Fetch failed", e);
            setIsLoadingData(false);
        } finally {
            clearInterval(interval);
        }
    };

    const handleSaveLog = (fQty, fPrice, isDefense = false) => {
        const newLog = {
            date: new Date().toLocaleString(),
            timestamp: Date.now(),
            side: isDefense || signal.status.includes('SIGNAL') || signal.status === 'TRIGGERED' ? 'BUY' : 'SELL',
            qty: parseFloat(fQty),
            price: parseFloat(fPrice),
            amount: parseFloat(fQty) * parseFloat(fPrice) * strategyConfig.fxKrwUsd
        };
        setTradeLogs([newLog, ...tradeLogs]);
    };

    const handleDeleteLog = (target) => {
        if (target === 'all') {
            triggerConfirm(t('clearLogBtn') + '?', () => setTradeLogs([]));
        } else {
            const newLogs = [...tradeLogs];
            newLogs.splice(target, 1);
            setTradeLogs(newLogs);
        }
    };

    const handleTickerChange = (newTicker) => {
        setTicker(newTicker);
        const newConfig = { ...strategyConfig, targetTicker: newTicker };
        setStrategyConfig(newConfig);
        localStorage.setItem('strategyConfig', JSON.stringify(newConfig));
        // Reset overrides and optionally load data
        setOverridePrice(0);
        setOverrideQty(0);
        loadData(newTicker);
    };

    const handleSaveConfig = (newConfig) => {
        setStrategyConfig(newConfig);
        localStorage.setItem('strategyConfig', JSON.stringify(newConfig));
        if (newConfig.targetTicker) {
            setTicker(newConfig.targetTicker);
        }
        // Force reset overrides to ensure new calculated price shows up
        setOverridePrice(0);
        setOverrideQty(0);
        setShowSettingsModal(false);
        // Refresh data for the new ticker
        loadData(newConfig.targetTicker || ticker);
    };

    const handleReset = () => {
        triggerConfirm(t('resetBtn') + '?', () => {
            // Save current cycle to history if trades exist
            if (tradeLogs.length > 0) {
                const buys = tradeLogs.filter(l => l.side === 'BUY');
                const sells = tradeLogs.filter(l => l.side === 'SELL');

                const totalInvestedKrw = buys.reduce((acc, l) => acc + (l.amount || 0), 0);
                const totalSoldKrw = sells.reduce((acc, l) => acc + (l.amount || 0), 0);
                const totalBuyQty = buys.reduce((acc, l) => acc + (l.qty || 0), 0);
                const totalSellQty = sells.reduce((acc, l) => acc + (l.qty || 0), 0);
                const currentHoldings = totalBuyQty - totalSellQty;
                const currentValuationKrw = currentHoldings * currentPrice * strategyConfig.fxKrwUsd;

                const totalProfitKrw = (totalSoldKrw + currentValuationKrw) - totalInvestedKrw;
                // Profit Rate based on Total Capital (ROI), not just Invested Amount
                const profitRate = strategyConfig.totalCapital > 0 ? (totalProfitKrw / strategyConfig.totalCapital) * 100 : 0;

                // Duration Calculation
                const timestamps = tradeLogs.map(l => l.timestamp || new Date(l.date).getTime()).filter(t => !isNaN(t));
                const startTs = Math.min(...timestamps);
                const endTs = Date.now();
                const durationDays = Math.max(1, Math.ceil((endTs - startTs) / (1000 * 60 * 60 * 24)));

                const cycleSummary = {
                    date: new Date().toLocaleDateString(),
                    endTime: new Date().toLocaleTimeString(),
                    startDate: new Date(startTs).toLocaleDateString(),
                    endDate: new Date(endTs).toLocaleDateString(),
                    durationDays: durationDays,
                    ticker: ticker,
                    totalInvestedKrw: totalInvestedKrw,
                    profitKrw: totalProfitKrw,
                    profitRate: profitRate,
                    turns: turn,
                    isCompleted: currentHoldings === 0,
                    isFailed: signal.status === 'FAILED' || (currentHoldings > 0 && signal.status !== 'SELL')
                };

                setCompletedCycles(prev => [cycleSummary, ...prev]);
            }

            setTurn(0);
            setTradeLogs([]);
            setHighPrice(0); // Reset highPrice tracking for the new cycle
            setStrategyConfig(prev => ({ ...prev, avgPrice: 0 }));
            setSignal(prev => ({ ...prev, status: 'SIGNAL_ON', message: 'RESET SUCCESS' }));
        });
    };

    const handleDeleteCycle = (idx) => {
        if (idx === 'all') {
            triggerConfirm(t('clearLogBtn') + '?', () => {
                setCompletedCycles([]);
            });
            return;
        }
        const newCycles = [...completedCycles];
        newCycles.splice(idx, 1);
        setCompletedCycles(newCycles);
    };

    const handleToggleDefense = () => {
        const slotCap = strategyConfig.totalCapital / strategyConfig.totalSlots;
        const q = (slotCap / currentPrice) * (strategyConfig.defenseFactor || 0.7);

        handleSaveLog(q, currentPrice, true); // Explicitly pass true for defense buy
        setHighPrice(currentPrice); // Reset highPrice tracking

        setTurn(prev => {
            const defStart = strategyConfig.totalSlots - strategyConfig.defenseSlotsThreshold;
            const next = Math.max(prev + 1, defStart + 1);
            return Math.min(strategyConfig.totalSlots, next);
        });

        setSignal(prev => ({ ...prev, status: 'TRIGGERED' }));
    };

    const handleExecute = () => {
        if (signal.status === 'COMPLETED') {
            alert('?대? ?ъ씠?댁씠 ?꾨즺?섏뿀?듬땲?? 珥덇린?????ㅼ떆 ?쒖옉?댁＜?몄슂.');
            return;
        }

        // Check if it's a SELL order
        if (sellingOrders.length > 0) {
            const sellOrder = sellingOrders[0];
            const finalPrice = overridePrice > 0 ? overridePrice : sellOrder.price;
            const finalQty = overrideQty > 0 ? overrideQty : sellOrder.quantity;

            // Calculate current holdings
            const totalBuyQty = tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + curr.qty, 0);
            const totalSellQty = tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + curr.qty, 0);
            const currentHoldings = totalBuyQty - totalSellQty;

            // Validate sell quantity (with small epsilon for floating point safety)
            if (finalQty > currentHoldings + 0.00000001) {
                alert(`留ㅻ룄 ?섎웾(${finalQty})??蹂댁쑀 ?섎웾(${currentHoldings})??珥덇낵?⑸땲??`);
                return;
            }

            // Add SELL log
            const newLog = {
                date: new Date().toLocaleString(),
                timestamp: Date.now(),
                side: 'SELL',
                qty: finalQty,
                price: finalPrice,
                amount: finalQty * finalPrice * strategyConfig.fxKrwUsd,
                fx: strategyConfig.fxKrwUsd,
                note: sellOrder.type === 'SOUL_ESCAPE' ? `Soul-Escape: ${sellOrder.message}` : sellOrder.message
            };
            setTradeLogs(prev => [newLog, ...prev]);

            // Reset overrides
            setOverridePrice(0);
            setOverrideQty(0);

            // SOUL-ESCAPE: Decrement turn to reload bullets
            if (sellOrder.type === 'SOUL_ESCAPE') {
                const reloadAmount = Math.floor(strategyConfig.totalSlots * 0.25);
                setTurn(prev => Math.max(0, prev - reloadAmount));
            }

            return;
        }

        // Otherwise, handle BUY order
        const buyOrder = orders.find(o => o.type.includes('START') || o.type.includes('DAILY') || o.type.includes('TRIGGER'));
        if (buyOrder) {
            // Use overridePrice if available, otherwise buyOrder.price (which is usually currentPrice or LOC)
            // But wait, buyingOrder calculation already gives us a price. 
            // If user overrides price, we should recalculate Quantity based on SLOT AMOUNT targeting that price.
            // Actually, logic.js calculates quantity based on currentPrice.
            // If user changes price, we should use that price.

            const finalPrice = overridePrice > 0 ? overridePrice : buyOrder.price;

            // Recalculate Qty
            // 1. If User set Qty manually -> Use it
            // 2. If User set Price (or Default) -> Auto-calc based on Slot Amount

            let finalQty = 0;
            if (overrideQty > 0) {
                finalQty = overrideQty;
            } else {
                // DYNAMIC SLOT BUDGET calculation for handleExecute
                const buys = tradeLogs.filter(l => l.side === 'BUY');
                const sells = tradeLogs.filter(l => l.side === 'SELL');
                const actualUsedCapitalKrw = buys.reduce((acc, curr) => acc + (curr.amount || 0), 0) - sells.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                const actualRemainingCapitalKrw = Math.max(0, strategyConfig.totalCapital - actualUsedCapitalKrw);
                const remainingSlots = Math.max(1, strategyConfig.totalSlots - turn);
                const effectiveDivisor = remainingSlots;

                const dynamicSlotAmtKrw = (actualRemainingCapitalKrw / effectiveDivisor) * (signal.multiplier || 1.0);

                // Sweep Logic: If it's the last regular slot or beyond, use all remaining capital if multiplier >= 1
                const finalBudgetKrw = (turn >= strategyConfig.totalSlots - 1 && (signal.multiplier || 1) >= 1)
                    ? actualRemainingCapitalKrw
                    : dynamicSlotAmtKrw;

                finalQty = Math.floor((finalBudgetKrw / strategyConfig.fxKrwUsd) / finalPrice);
            }

            handleSaveLog(finalQty, finalPrice);
            setHighPrice(finalPrice); // Reset highPrice tracking when buying more
            setTurn(prev => prev + 1);

            if (currentMode === 'DEFENSE') {
                setDefenseCooldown(prev => prev + 1);
            } else {
                setDefenseCooldown(0);
            }
            // Reset overrides after execution
            setOverridePrice(0);
            setOverrideQty(0);
        }
    };

    const handleUndo = () => {
        if (turn > 0) {
            setTurn(prev => prev - 1);
            // Remove the most recent log
            setTradeLogs(prev => {
                const newLogs = [...prev];
                newLogs.shift(); // TradeLog is sorted newest first
                return newLogs;
            });
            if (currentMode === 'DEFENSE') {
                setDefenseCooldown(prev => Math.max(0, prev - 1));
            }
        }
    };

    const handleVerified = (token) => {
        setIsAuthorized(true);
        localStorage.setItem('isAuthorized', 'true');
        localStorage.setItem('auth_token', token);
    };

    if (!isAuthorized) {
        return <AccessCodeGuard onVerified={handleVerified} t={t} />;
    }

    return (
        <div className="app-shell">
            <Header
                language={language}
                setLanguage={setLanguage}
                ticker={ticker}
                setTicker={handleTickerChange}
                isLocked={tradeLogs.length > 0}
                onFetch={handleFetch}
                onSettings={() => setShowSettingsModal(true)}
                onViewHistory={() => setShowCycleHistoryModal(true)}
                t={t}
            />

            <main className="main-container">
                {!isMobileViewport ? (
                    <>
                        {/* DESKTOP/TABLET GRID LAYOUT */}
                        <DecisionCard
                            status={signal.status}
                            currentMode={currentMode}
                            multiplier={sellingOrders.length > 0 ? '1.0' : signal.multiplier}
                            amount={sellingOrders.length > 0
                                ? (sellingOrders[0].quantity * sellingOrders[0].price * strategyConfig.fxKrwUsd)
                                : (orders.length > 0 ? Math.max(1, orders[0].quantity * orders[0].price * strategyConfig.fxKrwUsd) : 0)
                            }
                            price={sellingOrders.length > 0 ? sellingOrders[0].price : (orders.length > 0 ? orders[0].price : currentPrice)}
                            onExecute={handleExecute}
                            onReset={handleReset}
                            onUndo={handleUndo}
                            onViewHistory={() => setShowCycleHistoryModal(true)}
                            onRefresh={handleRefreshData}
                            isRefreshing={isRefreshing}
                            refreshSuccess={refreshSuccess}
                            lastUpdated={lastUpdated}
                            metrics={metrics}
                            turn={turn}
                            totalSlots={strategyConfig.totalSlots}
                            exposure={metrics.currentExposure}
                            overridePrice={overridePrice}
                            setOverridePrice={setOverridePrice}
                            overrideQty={overrideQty}
                            setOverrideQty={setOverrideQty}
                            fx={strategyConfig.fxKrwUsd}
                            capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                            orderQty={sellingOrders.length > 0
                                ? sellingOrders[0].quantity
                                : (orders.length > 0 ? Math.max(1, orders[0].quantity) : 0)
                            }
                            t={t}
                        />

                        <WhySection
                            rsi={rsi}
                            gapDrop={prevClose > 0 ? (((currentPrice - prevClose) / prevClose) * 100).toFixed(1) : 0}
                            belowAvg={currentPrice < (strategyConfig.avgPrice || currentPrice)}
                            triggerHit={signal.status === 'TRIGGERED'}
                            defenseReason={metrics.defenseReason}
                            currentPrice={currentPrice}
                            avgPrice={strategyConfig.avgPrice || 0}
                            profitRate={strategyConfig.avgPrice > 0 ? (((currentPrice - strategyConfig.avgPrice) / strategyConfig.avgPrice) * 100) : 0}
                            totalHoldings={tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)}
                            t={t}
                        />

                        <AmmoMagazine
                            config={strategyConfig}
                            currentTurn={turn}
                            investedCapital={tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                            capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                            slotAmount={metrics.slotAmount}
                            tradeLogs={tradeLogs}
                            onRevive={handleUndo}
                            history={history}
                            t={t}
                        />

                        <div className="zone-c">
                            <ErrorBoundary>
                                <StrategyState
                                    ticker={ticker}
                                    turn={turn}
                                    maxTurns={strategyConfig.totalSlots}
                                    slotsUsed={turn}
                                    avgPrice={strategyConfig.avgPrice}
                                    capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                                    exposure={metrics.currentExposure}
                                    mdd={metrics.mdd || 0}
                                    fx={strategyConfig.fxKrwUsd}
                                    triggerPct={Math.abs(strategyConfig.gapDropThreshold)}
                                    totalCapital={strategyConfig.totalCapital}
                                    defenseMode={metrics.isDefense}
                                    currentPrice={currentPrice}
                                    nextSlotAmount={metrics.slotAmount}
                                    t={t}
                                />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <PriceChart
                                    history={history}
                                    currentPrice={currentPrice}
                                    avgPrice={strategyConfig.avgPrice || 0}
                                    targetPct={strategyConfig.tp1Trigger || 10}
                                    ticker={ticker}
                                    t={t}
                                />
                            </ErrorBoundary>
                        </div>

                        <TradeLog
                            logs={tradeLogs}
                            onDelete={handleDeleteLog}
                            onViewAll={() => setShowHistoryModal(true)}
                            currentPrice={currentPrice}
                            avgPrice={strategyConfig.avgPrice || 0}
                            fx={strategyConfig.fxKrwUsd}
                            totalCapital={strategyConfig.totalCapital}
                            t={t}
                        />
                    </>
                ) : (
                    <div className="mobile-view-container">
                        <div className="mobile-slide-wrapper" style={{ transform: `translateX(${activeTab === 'TRADING' ? '0%' : activeTab === 'CHART' ? '-100%' : '-200%'})` }}>
                            {/* TAB 1: TRADING */}
                            <div className="mobile-tab-content">
                                <DecisionCard
                                    status={signal.status}
                                    currentMode={currentMode}
                                    multiplier={sellingOrders.length > 0 ? '1.0' : signal.multiplier}
                                    amount={sellingOrders.length > 0
                                        ? (sellingOrders[0].quantity * sellingOrders[0].price * strategyConfig.fxKrwUsd)
                                        : (orders.length > 0 ? Math.max(1, orders[0].quantity * orders[0].price * strategyConfig.fxKrwUsd) : 0)
                                    }
                                    price={sellingOrders.length > 0 ? sellingOrders[0].price : (orders.length > 0 ? orders[0].price : currentPrice)}
                                    onExecute={handleExecute}
                                    onReset={handleReset}
                                    onUndo={handleUndo}
                                    onViewHistory={() => setShowCycleHistoryModal(true)}
                                    onRefresh={handleRefreshData}
                                    isRefreshing={isRefreshing}
                                    refreshSuccess={refreshSuccess}
                                    lastUpdated={lastUpdated}
                                    metrics={metrics}
                                    turn={turn}
                                    totalSlots={strategyConfig.totalSlots}
                                    exposure={metrics.currentExposure}
                                    overridePrice={overridePrice}
                                    setOverridePrice={setOverridePrice}
                                    overrideQty={overrideQty}
                                    setOverrideQty={setOverrideQty}
                                    fx={strategyConfig.fxKrwUsd}
                                    capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                                    orderQty={sellingOrders.length > 0
                                        ? sellingOrders[0].quantity
                                        : (orders.length > 0 ? Math.max(1, orders[0].quantity) : 0)
                                    }
                                    t={t}
                                />
                                <WhySection
                                    rsi={rsi}
                                    gapDrop={prevClose > 0 ? (((currentPrice - prevClose) / prevClose) * 100).toFixed(1) : 0}
                                    belowAvg={currentPrice < (strategyConfig.avgPrice || currentPrice)}
                                    triggerHit={signal.status === 'TRIGGERED'}
                                    defenseReason={metrics.defenseReason}
                                    currentPrice={currentPrice}
                                    avgPrice={strategyConfig.avgPrice || 0}
                                    profitRate={strategyConfig.avgPrice > 0 ? (((currentPrice - strategyConfig.avgPrice) / strategyConfig.avgPrice) * 100) : 0}
                                    totalHoldings={tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)}
                                    t={t}
                                />
                            </div>

                            {/* TAB 2: CHART */}
                            <div className="mobile-tab-content">
                                <PriceChart
                                    history={history}
                                    currentPrice={currentPrice}
                                    avgPrice={strategyConfig.avgPrice || 0}
                                    targetPct={strategyConfig.tp1Trigger || 10}
                                    ticker={ticker}
                                    t={t}
                                />
                                <AmmoMagazine
                                    config={strategyConfig}
                                    currentTurn={turn}
                                    investedCapital={tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                                    capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                                    slotAmount={metrics.slotAmount}
                                    tradeLogs={tradeLogs}
                                    onRevive={handleUndo}
                                    history={history}
                                    t={t}
                                />
                            </div>

                            {/* TAB 3: HISTORY */}
                            <div className="mobile-tab-content">
                                <StrategyState
                                    ticker={ticker}
                                    turn={turn}
                                    maxTurns={strategyConfig.totalSlots}
                                    slotsUsed={turn}
                                    avgPrice={strategyConfig.avgPrice}
                                    capitalRemaining={strategyConfig.totalCapital - (tradeLogs.filter(l => l.side === 'BUY').reduce((acc, curr) => acc + (curr.amount || 0), 0) - tradeLogs.filter(l => l.side === 'SELL').reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                                    exposure={metrics.currentExposure}
                                    mdd={metrics.mdd || 0}
                                    fx={strategyConfig.fxKrwUsd}
                                    triggerPct={Math.abs(strategyConfig.gapDropThreshold)}
                                    totalCapital={strategyConfig.totalCapital}
                                    defenseMode={metrics.isDefense}
                                    currentPrice={currentPrice}
                                    nextSlotAmount={metrics.slotAmount}
                                    t={t}
                                />
                                <TradeLog
                                    logs={tradeLogs}
                                    onDelete={handleDeleteLog}
                                    onViewAll={() => setShowHistoryModal(true)}
                                    currentPrice={currentPrice}
                                    avgPrice={strategyConfig.avgPrice || 0}
                                    fx={strategyConfig.fxKrwUsd}
                                    totalCapital={strategyConfig.totalCapital}
                                    t={t}
                                />
                                <div style={{ height: '80px' }}></div> {/* Spacer for bottom nav */}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {isMobileViewport && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />}

            {/* LOADING OVERLAY */}
            {isLoadingData && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <h3 className="loading-title">援ш? ?쒖꽭 ?곗씠??遺꾩꽍 以?/h3>
                        <p className="loading-subtitle">{ticker} ?ㅼ떆媛??뺣낫 二쇱엯...</p>
                        <div className="loading-percentage">{loadingProgress}%</div>
                        <div className="progress-container">
                            <div className="progress-bar-fill" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* FETCH RESULT MODAL */}
            <FetchResultModal
                isOpen={showFetchModal}
                onClose={() => setShowFetchModal(false)}
                data={{
                    ticker: ticker,
                    price: currentPrice,
                    rsi: rsi,
                    history: history,
                    isSimulation: isSimulationMode
                }}
                t={t}
            />
            {/* FULL HISTORY MODAL */}
            <TradeLogModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                logs={tradeLogs}
                onDelete={handleDeleteLog}
                currentPrice={currentPrice}
                fx={strategyConfig.fxKrwUsd}
                triggerConfirm={triggerConfirm}
                t={t}
            />
            {/* CYCLES HISTORY MODAL */}
            <CompletedCyclesModal
                isOpen={showCycleHistoryModal}
                onClose={() => setShowCycleHistoryModal(false)}
                cycles={completedCycles}
                onDelete={handleDeleteCycle}
                triggerConfirm={triggerConfirm}
                t={t}
            />
            {/* SETTINGS MODAL */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                config={strategyConfig}
                onSave={handleSaveConfig}
                isLocked={tradeLogs.length > 0}
                t={t}
            />

            {/* CUSTOM CONFIRM MODAL */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
                t={t}
            />

            <footer className="app-footer">
                <div className="footer-content">
                    <span className="creator-mark creator-mark-animated">Chart Finder x Antigravity</span>
                </div>
            </footer>
        </div>
    );
}

export default App;
