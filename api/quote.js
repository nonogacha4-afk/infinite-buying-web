const yahooFinance = require('yahoo-finance2');

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
}

module.exports = async (req, res) => {
    const ticker = req.query.ticker || 'TQQQ';

    try {
        const googleUrl = `https://www.google.com/finance/quote/${ticker}:NASDAQ`;
        const response = await fetchWithTimeout(googleUrl);
        const html = await response.text();
        const match = html.match(/data-last-price="([\d.]+)"/);
        if (match) {
            return res.json({ price: parseFloat(match[1]), source: 'Google Finance' });
        }
    } catch (err) { }

    try {
        const quote = await yahooFinance.quote(ticker);
        if (quote && quote.regularMarketPrice) {
            return res.json({
                price: quote.regularMarketPrice,
                source: 'Yahoo Finance'
            });
        }
    } catch (err) { }

    res.status(500).json({ error: 'All quote sources failed' });
};
