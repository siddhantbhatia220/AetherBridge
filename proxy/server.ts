import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadConfig, ProviderFactory } from './factory.js';
import { validateEnvironment, sanitize } from './utils.js';
import { initDB } from './db.js';
import { ShadowPaymentAdapter } from '../adapters/shadow.js';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const config = loadConfig();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for photos

// Serve Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Pre-flight check
validateEnvironment(config);

// Initialize Providers
const auth = ProviderFactory.createAuthProvider(config);
const pay = ProviderFactory.createPaymentProvider(config);
const notify = ProviderFactory.createNotificationProvider(config);
const storage = ProviderFactory.createStorageProvider(config);
const data = ProviderFactory.createDataProvider(config);
const aiProvider = ProviderFactory.createAIProvider(config);

let db: any;

async function startServer() {
    db = await initDB();

    const logToDB = async (method: string, data: any, status: string) => {
        const cleanData = sanitize(data);
        await db.run(
            'INSERT INTO logs (method, payload, status) VALUES (?, ?, ?)',
            [method, JSON.stringify(cleanData), status]
        );
    };

    // --- Auth Routes ---
    app.post('/auth/signup', async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await auth.signUp(email, password);
            await logToDB('signup', { email }, 'success');
            res.json(user);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    app.post('/auth/signin', async (req, res) => {
        try {
            const { email, password } = req.body;
            const session = await auth.signIn(email, password);
            res.json(session);
        } catch (err: any) {
            res.status(401).json({ error: err.message });
        }
    });

    // --- Payment Routes ---
    app.post('/pay/initializePayment', async (req, res) => {
        try {
            const { amount, currency, customerId } = req.body;
            const session = await pay.initializePayment(amount, currency, customerId);
            await logToDB('payment_init', { amount, currency }, 'success');
            res.json(session);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Notify Routes ---
    app.post('/notify/sms', async (req, res) => {
        try {
            const { to, message } = req.body;
            const result = await notify.sendSMS(to, message);
            await logToDB('sms_sent', { to }, 'success');
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Storage Routes ---
    app.post('/storage/upload', async (req, res) => {
        try {
            const { file, fileName } = req.body;
            const result = await storage.uploadFile(file, fileName);
            await logToDB('file_upload', { fileName }, 'success');
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Data Routes ---
    app.post('/data/parsePhone', async (req, res) => {
        try {
            const { text, region } = req.body;
            const result = await data.parsePhone(text, region);
            await logToDB('phone_parse', { textSnippet: text.substring(0, 20) }, 'success');
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- AI Routes ---
    app.post('/ai/summarize', async (req, res) => {
        try {
            const { text } = req.body;
            const summary = await aiProvider.summarize(text);
            await logToDB('ai_summarize', { textSnippet: text.substring(0, 20) }, 'success');
            res.json({ summary });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/ai/analyze', async (req, res) => {
        try {
            const { data } = req.body;
            const analysis = await aiProvider.analyze(data);
            await logToDB('ai_analyze', { data }, 'success');
            res.json({ analysis });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/ai/generate', async (req, res) => {
        try {
            const { prompt } = req.body;
            const content = await aiProvider.generate(prompt);
            await logToDB('ai_generate', { prompt }, 'success');
            res.json({ content });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/ai/extractDataFromImages', async (req, res) => {
        try {
            const { images } = req.body; // Array of base64
            const result = await aiProvider.extractDataFromImages(images);
            await logToDB('ai_extract_images', { count: images.length }, 'success');
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/data/export-excel', async (req, res) => {
        try {
            const { data } = req.body; // Array of objects
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="extracted_data.xlsx"');
            res.send(buffer);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/logs', async (req, res) => {
        try {
            const rows = await db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`\x1b[35m[AetherBridge Proxy]\x1b[0m Listening on port ${PORT}`);
        if (config.mode === 'development') {
            console.log(`\x1b[36m[Shadow Kernel]\x1b[0m Intercepting all calls locally.`);
        }
    });
}

startServer().catch(err => {
    console.error("Failed to start AetherBridge Proxy:", err);
});
