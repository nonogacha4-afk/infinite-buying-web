import yahooFinance from 'yahoo-finance2';

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

async function getGoogleQuote(ticker) {
    try {
        const url = `https://www.google.com/finance/quote/${ticker}:NASDAQ`;
        const res = await fetchWithTimeout(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const html = await res.text();
        const patterns = [
            /data-last-price="([\d,.]+)"/,
            /class="YMlKec fxKb9e">\$?([\d,.]+)</,
            /class="I97fub">\$?([\d,.]+)</
        ];
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                const price = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(price) && price > 0) return { regularMarketPrice: price, price: price, source: 'google' };
            }
        }
    } catch (err) { }
    return null;
}

export default async (req, res) => {
    const ticker = req.query.ticker || 'TQQQ';
    const googleData = await getGoogleQuote(ticker);
    if (googleData) return res.json(googleData);

    try {
        const quote = await yahooFinance.quote(ticker);
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: 'All quote sources failed' });
    }
};
