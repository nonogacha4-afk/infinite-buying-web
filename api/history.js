const yahooFinance = require('yahoo-finance2').default;

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

async function getStooqHistory(ticker) {
    try {
        const stooqTicker = ticker.includes('.') ? ticker : `${ticker}.US`;
        const url = `https://stooq.com/q/d/l/?s=${stooqTicker}&i=d`;
        const res = await fetchWithTimeout(url);
        const csv = await res.text();
        const lines = csv.trim().split('\n');
        if (lines.length < 2) return null;
        const data = lines.slice(1).map(line => {
            const cols = line.split(',');
            return {
                date: cols[0],
                open: parseFloat(cols[1]),
                high: parseFloat(cols[2]),
                low: parseFloat(cols[3]),
                close: parseFloat(cols[4]),
                volume: parseInt(cols[5]) || 0
            };
        });
        return data.slice(-100).filter(d => !isNaN(d.close));
    } catch (err) { }
    return null;
}

module.exports = async (req, res) => {
    const ticker = req.query.ticker || 'TQQQ';
    const stooqData = await getStooqHistory(ticker);
    if (stooqData && stooqData.length > 0) return res.json(stooqData);

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 100);
        const result = await yahooFinance.historical(ticker, {
            period1: startDate.toISOString().split('T')[0],
            period2: endDate.toISOString().split('T')[0],
            interval: '1d'
        });
        const formatted = result.map(item => ({
            date: item.date.toISOString().split('T')[0],
            close: item.close,
            high: item.high,
            low: item.low,
            open: item.open,
            volume: item.volume
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'All history sources failed' });
    }
};
