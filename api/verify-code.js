const VALID_CODES = [
    'LAO2026',
    'CHART_FINDER_2026',
    'INFINITE_BUY_2026'
];

module.exports = (req, res) => {
    const { code } = req.body;

    if (VALID_CODES.includes(code)) {
        return res.json({ success: true, token: 'valid_access_token' });
    }

    res.status(401).json({ success: false, error: 'Invalid code' });
};
