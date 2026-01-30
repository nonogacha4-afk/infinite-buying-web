import yahooFinance from 'yahoo-finance2';

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
};

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
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

export default async (req, res) => {
    const ticker = req.query.ticker || 'TQQQ';
    console.log(`[Quote API] Fetching quote for ${ticker}...`);

    // Source 1: Google Finance Scraping
    try {
        const googleUrl = `https://www.google.com/finance/quote/${ticker}:NASDAQ`;
        const response = await fetchWithTimeout(googleUrl);
        if (response.ok) {
            const html = await response.text();
            const match = html.match(/data-last-price="([\d.]+)"/);
            if (match) {
                console.log(`[Quote API] Found price for ${ticker} on Google Finance: ${match[1]}`);
                return res.json({ price: parseFloat(match[1]), source: 'Google Finance' });
            }
        }
    } catch (err) {
        console.warn(`[Quote API] Google Finance failed for ${ticker}:`, err.message);
    }

    // Source 2: Yahoo Finance (Official Library)
    try {
        const quote = await yahooFinance.quote(ticker);
        if (quote && quote.regularMarketPrice) {
            console.log(`[Quote API] Found price for ${ticker} on Yahoo Finance: ${quote.regularMarketPrice}`);
            return res.json({
                price: quote.regularMarketPrice,
                source: 'Yahoo Finance'
            });
        }
    } catch (err) {
        console.warn(`[Quote API] Yahoo Finance failed for ${ticker}:`, err.message);
    }

    console.error(`[Quote API] All sources failed for ${ticker}`);
    res.status(500).json({ error: 'All quote sources failed' });
};

