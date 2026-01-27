const VALID_CODES = [
    'WELCOME_LAO',
    'ANTIGRAVITY_2026',
    'CHART_FINDER_PRO',
    'PRIVATE_ACCESS_777',
    '1004',
    'CHARTFINDER',
    'chartfinder'
];

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    if (VALID_CODES.includes(code.toUpperCase().trim()) || VALID_CODES.includes(code.trim())) {
        const authToken = `valid_session_${Date.now()}`;
        return res.json({ success: true, token: authToken });
    } else {
        return res.status(401).json({ success: false, error: 'Invalid invitation code' });
    }
};
