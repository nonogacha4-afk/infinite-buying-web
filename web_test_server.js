const express = require('express');
const cors = require('cors');
const quoteApi = require('./api/quote');
const historyApi = require('./api/history');
const verifyCodeApi = require('./api/verify-code');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock Vercel req/res for local Testing
const wrapApi = (apiFunc) => async (req, res) => {
    try {
        await apiFunc(req, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

app.get('/api/quote', wrapApi(quoteApi));
app.get('/api/history', wrapApi(historyApi));
app.post('/api/verify-code', wrapApi(verifyCodeApi));

app.listen(PORT, () => {
    console.log(`Web Test API Server running on http://localhost:${PORT}`);
});
