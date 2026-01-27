/**
 * LAOG_PT Trading Strategy Logic
 * (Refactored to support dynamic configuration)
 */

export const defaultStrategyConfig = {
  strategyName: 'LAOG_PT',
  version: 'v2.3.0',
  totalCapital: 5000000,
  totalSlots: 20,
  rsiPeriod: 14,
  rsiOversold: 30,
  rsiOversoldStrong: 25,
  rsiOverbought: 70,
  rsiOverboughtStrong: 75,
  rsiCouponMax: 3,
  gapDropThreshold: -6,
  tp1Trigger: 10,
  tp1SellRatio: 50,
  trailStop: -3,
  trailStopStrong: -4,
  trailStopVeryStrong: -5,
  defenseSlotsThreshold: 8,
  defenseCashThreshold: 8,
  defenseBuyFactor: 0.7,
  fxKrwUsd: 1466.6,
  buyPriceDropPct: 0, // Order price % drop from prevClose
  targetTicker: 'TQQQ' // Default fixed ticker
};

export const calculateBuyingOrder = (
  turn,         // Current turn (slots used)
  config,       // Complete config object
  avgPrice,
  currentPrice,
  rsi,
  prevClose = 0,
  highPrice = 0,
  currentMode = 'NORMAL',
  defenseCooldown = 0,
  actualRemainingCapital = null // New: Actual available budget from App
) => {
  const {
    totalCapital,
    totalSlots,
    rsiOversold,
    rsiOversoldStrong,
    rsiOverbought,
    rsiOverboughtStrong,
    gapDropThreshold,
    defenseSlotsThreshold,
    defenseBuyFactor,
    fxKrwUsd
  } = config;

  // DYNAMIC 1/N REDISTRIBUTION
  // Formula: Remaining Budget / Remaining Slots
  // This ensures that after Soul-Escape (when slots are low), we use the remaining budget fully across remaining turns.
  const remainingSlots = Math.max(1, totalSlots - turn);
  const effectiveDivisor = remainingSlots;

  const currentRemainingCapital = actualRemainingCapital !== null ? actualRemainingCapital : (totalCapital - (turn * (totalCapital / totalSlots)));
  const ONE_SLOT_AMOUNT = currentRemainingCapital / effectiveDivisor;
  const basePrice = avgPrice || currentPrice;
  const isStartMode = turn === 0 || avgPrice === 0;

  // 1. Compute Inputs for Defense Logic
  const gapDrop = prevClose > 0 ? ((currentPrice - prevClose) / prevClose * 100) : 0;
  const mdd = calculateMDD(currentPrice, basePrice);

  const slotRisk = turn >= (totalSlots - defenseSlotsThreshold);
  const gapShock = gapDrop <= -4.0;
  const oversold = rsi <= 30;
  const deepDrawdown = parseFloat(mdd) <= -12.0;

  // 2. State Machine: Determine New Mode
  let nextMode = currentMode;
  let reasons = [];
  if (slotRisk) reasons.push('SlotRisk');
  if (gapShock) reasons.push('GapShock');
  if (oversold) reasons.push('Oversold');
  if (deepDrawdown) reasons.push('DeepDD');

  const entryConditionsMet = [slotRisk, gapShock, oversold, deepDrawdown].filter(Boolean).length >= 2;

  if (currentMode === 'NORMAL') {
    if (entryConditionsMet) {
      nextMode = 'DEFENSE';
    }
  } else if (currentMode === 'DEFENSE') {
    // Exit Logic (only if cooldown satisfied)
    const exitCooldownMet = defenseCooldown >= 3 || defenseCooldown >= 2; // Logic: 3 days OR 2 defense turns (simplified here to counter)
    const exitConditions = [
      rsi >= 45,
      gapDrop > -2,
      currentPrice >= avgPrice,
      turn < (totalSlots - defenseSlotsThreshold)
    ].filter(Boolean).length >= 2;

    if (exitCooldownMet && exitConditions) {
      nextMode = 'NORMAL';
    }
  }

  // 3. Multiplier & Strategy
  let multiplier = 1.0;
  if (rsi <= rsiOversoldStrong) multiplier = 1.5;
  else if (rsi <= rsiOversold) multiplier = 1.2;
  else if (rsi >= rsiOverboughtStrong) multiplier = 0.3;
  else if (rsi >= rsiOverbought) multiplier = 0.5;

  // Defense Buy Factor
  if (nextMode === 'DEFENSE') {
    multiplier *= (defenseBuyFactor || 0.7);
  }

  const isTriggered = gapDrop <= gapDropThreshold;

  const metrics = {
    mdd,
    volatilityDrag: calculateVolatilityDrag(0.2),
    currentExposure: ((turn * ONE_SLOT_AMOUNT) / totalCapital) * 100,
    slotAmount: ONE_SLOT_AMOUNT,
    isDefense: nextMode === 'DEFENSE',
    defenseReason: nextMode === 'DEFENSE' ? `Defense ON: ${reasons.join(' + ')}` : '',
    defenseConditions: {
      slotRisk,
      gapShock,
      oversold,
      deepDrawdown,
      entryConditionsMetCount: [slotRisk, gapShock, oversold, deepDrawdown].filter(Boolean).length
    }
  };

  // Calculate customized order price based on drop percentage from currentPrice
  let finalBuyingPrice = currentPrice;
  if (config.buyPriceDropPct !== 0) {
    finalBuyingPrice = currentPrice * (1 - config.buyPriceDropPct / 100);
  }

  // Sweep Logic: If it's the last regular slot or beyond, use all remaining capital if multiplier >= 1
  // Or if we want to be aggressive, always sweep on the last slot.
  let finalAmount = ONE_SLOT_AMOUNT * multiplier;
  if (turn >= (totalSlots - 1) && multiplier >= 1) {
    finalAmount = currentRemainingCapital;
  }

  // Ensure minimum 1 share if amount is intended
  const qty = Math.max(1, Math.floor(finalAmount / (finalBuyingPrice * fxKrwUsd)));

  const orders = [{
    type: isTriggered ? 'AUTO_TRIGGER' : (isStartMode ? 'START_ORDER' : 'DAILY_ORDER'),
    price: finalBuyingPrice,
    quantity: qty,
    multiplier: multiplier.toFixed(2)
  }];

  const isLackingCapital = qty === 0 && currentRemainingCapital < (finalBuyingPrice * fxKrwUsd);

  return {
    status: isLackingCapital && (turn >= totalSlots) ? 'FAILED' : (isTriggered ? 'TRIGGERED' : 'SIGNAL_ON'),
    message: isLackingCapital && (turn >= totalSlots) ? 'CAPITAL EXHAUSTED - FAILURE' : `${isTriggered ? 'GAP DROP!' : 'ROUTINE'} (RSI: ${rsi.toFixed(1)}, Multi: ${multiplier.toFixed(2)}x)${nextMode === 'DEFENSE' ? ' [DEFENSE]' : ''}`,
    orders: isLackingCapital ? [] : orders,
    metrics,
    multiplier,
    nextMode
  };
};

export const calculateSellingOrder = (avgPrice, totalQuantity, currentPrice, highPrice, config, hasPartialSell = false, turn = 0, totalSlots = 40, remainingCapital = null) => {
  if (totalQuantity <= 0 || avgPrice <= 0) return [];
  const { tp1Trigger, tp1SellRatio, trailStop, trailStopStrong, trailStopVeryStrong } = config;

  const profitRate = ((currentPrice - avgPrice) / avgPrice) * 100;
  const orders = [];

  // 1. Profit Taking Logic (Two-Step: 50% then 100%)
  if (profitRate >= tp1Trigger) {
    if (hasPartialSell) {
      // Step 2: Liquidate remaining holdings
      orders.push({
        type: 'TP_FULL_SELL',
        price: currentPrice,
        quantity: totalQuantity,
        message: `Final Liquidation (+${profitRate.toFixed(2)}%)`
      });
    } else {
      // Step 1: Sell 50%
      // BUG FIX: Ensure minimum quantity is 1
      const sellQty = Math.max(1, Math.floor(totalQuantity * (tp1SellRatio / 100)));
      orders.push({
        type: 'TP_PARTIAL_SELL',
        price: avgPrice * (1 + tp1Trigger / 100),
        quantity: sellQty,
        message: `TP1 Reached: Sell ${tp1SellRatio}%`
      });
    }
  }

  // 2. Trailing Stop
  // Only activate if no other orders exist yet (unless it's a stronger signal)
  // We allow checking this, but it will be overridden by Soul-Escape if needed.
  if (orders.length === 0 && highPrice >= avgPrice * 1.05) {
    let currentTrail = trailStop;
    if (profitRate >= 25) currentTrail = trailStopVeryStrong;
    else if (profitRate >= 15) currentTrail = trailStopStrong;

    const trailingPrice = highPrice * (1 + currentTrail / 100);
    if (currentPrice <= trailingPrice) {
      orders.push({
        type: 'TRAILING_STOP',
        price: currentPrice,
        quantity: totalQuantity,
        message: `Trailing Stop Hit (${currentTrail}%)`
      });
    }
  }

  // 3. SOUL-ESCAPE Logic (영혼탈출법)
  // Triggered when bullets are exhausted OR Capital is exhausted.
  // PRIORITY FIX: Provide absolute priority over weak signals.

  // Explicit type safety
  const numTurn = Number(turn);
  const numTotal = Number(totalSlots);

  // Trigger ONLY IF both ammo AND capital are exhausted. 
  // If capital remains, we allow "Bonus Turns".
  const isAmmoExhausted = numTurn >= numTotal;
  const isCapitalExhausted = remainingCapital !== null && Number(remainingCapital) < (Number(config.totalCapital || 0) / Number(config.totalSlots || 1) * 0.5);

  if (isAmmoExhausted && isCapitalExhausted) {
    // If we are NOT in a strong profit state (TP1), FORCE Soul-Escape.
    // This overrides Trailing Stop or any other weak sell signals.
    if (profitRate < tp1Trigger) {
      // Clear any existing orders (like Trailing Stop or weak TP)
      orders.length = 0;

      orders.push({
        type: 'SOUL_ESCAPE',
        price: avgPrice, // Break-even target
        quantity: Math.max(1, Math.floor(totalQuantity * 0.25)), // Exit 25%, min 1
        message: isCapitalExhausted ? 'Soul-Escape: Capital Exhausted' : 'Soul-Escape: Exit 25% at BEP'
      });

      console.log('✅ SOUL-ESCAPE ACTIVATED!', orders[0]);
    } else {
      console.log('❌ SOUL-ESCAPE BLOCKED: profitRate >= tp1Trigger', profitRate, '>=', tp1Trigger);
    }
  } else {
    console.log('❌ SOUL-ESCAPE NOT TRIGGERED: conditions not met');
  }

  return orders;
}

export const calculateMDD = (current, peak) => {
  if (peak <= 0) return 0;
  const drawdown = ((peak - current) / peak) * 100;
  return drawdown > 0 ? -drawdown : 0;
};

export const calculateVolatilityDrag = (annualVol) => {
  return (Math.pow(annualVol, 2) / 2) * 100;
};

export const calculateIndicators = (rawData) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length < 15) {
    return (rawData || []).map(d => ({
      ...d,
      close: Number(d.close) || 0,
      rsi: 50,
      change: 0
    }));
  }

  // 1. Sanitize and Calculate Changes
  const processed = rawData.map((d, i) => {
    const currentClose = Number(d.close) || 0;
    const prevClose = i > 0 ? (Number(rawData[i - 1].close) || 0) : currentClose;
    let change = 0;
    if (i > 0 && prevClose !== 0) {
      change = ((currentClose - prevClose) / prevClose) * 100;
    }
    return {
      ...d,
      close: currentClose,
      change: isFinite(change) ? parseFloat(change.toFixed(2)) : 0,
      rsi: 50 // Default
    };
  });

  // Calculate 14-day RSI (Wilder's Smoothing)
  let avgGain = 0;
  let avgLoss = 0;

  // Initial SMA for first 14 days
  for (let i = 1; i <= 14; i++) {
    const diff = processed[i].close - processed[i - 1].close;
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }

  avgGain /= 14;
  avgLoss /= 14;

  // Subsequent days
  for (let i = 15; i < processed.length; i++) {
    const diff = processed[i].close - processed[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * 13 + gain) / 14;
    avgLoss = (avgLoss * 13 + loss) / 14;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    processed[i].rsi = isFinite(rsi) ? parseFloat(rsi.toFixed(1)) : 50;
  }

  return processed.slice(-40);
};
