import yahooFinance from 'yahoo-finance2';

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
};

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        headers: { ...BROWSER_HEADERS, ...options.headers },
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

async function getStooqHistory(ticker) {
    try {
        const stooqTicker = ticker.includes('.') ? ticker : `${ticker}.US`;
        const url = `https://stooq.com/q/d/l/?s=${stooqTicker}&i=d`;
        console.log(`[History API] Fetching from Stooq: ${url}`);
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`Stooq responded with ${res.status}`);

        const csv = await res.text();
        const lines = csv.trim().split('\n');
        if (lines.length < 2) {
            console.warn(`[History API] Stooq returned empty/invalid CSV for ${ticker}`);
            return null;
        }

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
        const result = data.slice(-100).filter(d => !isNaN(d.close));
        console.log(`[History API] Successfully fetched ${result.length} days from Stooq for ${ticker}`);
        return result;
    } catch (err) {
        console.warn(`[History API] Stooq failed for ${ticker}:`, err.message);
    }
    return null;
}

export default async (req, res) => {
    const ticker = req.query.ticker || 'TQQQ';
    console.log(`[History API] Processing history request for ${ticker}...`);

    // Source 1: Stooq
    const stooqData = await getStooqHistory(ticker);
    if (stooqData && stooqData.length > 0) return res.json(stooqData);

    // Source 2: Yahoo Finance
    try {
        console.log(`[History API] Falling back to Yahoo Finance for ${ticker}...`);
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
        console.log(`[History API] Successfully fetched ${formatted.length} days from Yahoo Finance for ${ticker}`);
        res.json(formatted);
    } catch (error) {
        console.error(`[History API] All sources failed for ${ticker}:`, error.message);
        res.status(500).json({ error: 'All history sources failed' });
    }
};

