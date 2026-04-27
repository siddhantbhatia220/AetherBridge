import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ShadowAuthAdapter, ShadowPaymentAdapter } from '../adapters/shadow.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Singleton Instances (In prod, these would switch based on config)
const auth = new ShadowAuthAdapter();
const pay = new ShadowPaymentAdapter();

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', version: '1.0.0' });
});

// Unified Auth Routes
app.post('/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.signUp(email, password);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unified Payment Routes
app.post('/pay/initialize', async (req, res) => {
    try {
        const { amount, currency, customerId } = req.body;
        const session = await pay.initializePayment(amount, currency, customerId);
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\x1b[35m[AetherBridge Proxy]\x1b[0m Listening on port ${PORT}`);
    console.log(`\x1b[36m[Mode]\x1b[0m Shadow Kernel Active`);
});
