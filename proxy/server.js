import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { loadConfig, ProviderFactory } from './factory.js';
import { validateEnvironment, sanitize } from './utils.js';
import { initDB } from './db.js';

dotenv.config();

const config = loadConfig();

// Pre-Flight Validation
if (!validateEnvironment(config)) {
    process.exit(1);
}

const app = express();
const db = await initDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/shadow-storage', express.static('shadow-storage'));

// Failover Wrapper
const withFailover = async (primaryFn, fallbackFn) => {
    try {
        return await primaryFn();
    } catch (err) {
        console.warn(`[FAILOVER] Primary provider failed: ${err.message}. Triggering secondary...`);
        return await fallbackFn();
    }
};

// Load Real Configuration
const config = loadConfig();
console.log(`\x1b[35m[AetherBridge]\x1b[0m Running in ${config.mode} mode`);

// Initialize Providers via Factory
const auth = ProviderFactory.createAuthProvider(config);
const pay = ProviderFactory.createPaymentProvider(config);
const notify = ProviderFactory.createNotificationProvider(config);

const logToDB = async (method, data, status) => {
    const cleanData = sanitize(data);
    await db.run(
        'INSERT INTO logs (method, payload, status) VALUES (?, ?, ?)',
        [method, JSON.stringify(cleanData), status]
    );
};

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', version: '1.0.0', mode: config.mode });
});

// Unified Auth Routes
app.post('/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.signUp(email, password);
        await logToDB('AUTH.SIGNUP', { email }, 'success');
        res.json(user);
    } catch (err) {
        await logToDB('AUTH.SIGNUP', { error: err.message }, 'failed');
        console.error(`[AUTH ERROR] ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Unified Payment Routes
app.post('/pay/initialize', async (req, res) => {
    try {
        const { amount, currency, customerId } = req.body;
        const session = await withFailover(
            () => pay.initializePayment(amount, currency, customerId),
            () => new ShadowPaymentAdapter().initializePayment(amount)
        );
        await logToDB('PAY.INITIALIZE', { amount, currency }, 'intercepted');
        res.json(session);
    } catch (err) {
        await logToDB('PAY.INITIALIZE', { error: err.message }, 'failed');
        console.error(`[PAYMENT ERROR] ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Unified Notification Routes
app.post('/notify/sms', async (req, res) => {
    try {
        const { to, message } = req.body;
        const result = await notify.sendSMS(to, message);
        res.json(result);
    } catch (err) {
        console.error(`[NOTIFY ERROR] ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\x1b[35m[AetherBridge Proxy]\x1b[0m Listening on port ${PORT}`);
    if (config.mode === 'development') {
        console.log(`\x1b[36m[Shadow Kernel]\x1b[0m Intercepting all calls locally.`);
    }
});
