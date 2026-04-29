# AetherBridge Documentation & Developer Guide

## 🛠️ Installation & Setup

1.  **Initialize**: `npm run aether init`
2.  **Install Dependencies**: `npm install`
3.  **Start Dev Mode**: `npm run aether shadow`

## 🌉 Using the Bridges

### Authentication
```typescript
const user = await bridge.auth.signUp({ email: 'user@example.com', password: '...' });
```

### Payments
```typescript
const session = await bridge.pay.initializePayment({ amount: 1000, currency: 'INR' });
```

### AI (AetherAI)
```typescript
const summary = await bridge.ai.summarize({ text: '...' });
const data = await bridge.ai.extractDataFromImages({ images: [base64, ...] });
```

## 📈 Improvement Roadmap

### Current Limitations
- **Gemini Adapter**: Requires `GEMINI_API_KEY` for live image extraction. Currently falls back to Shadow logic.
- **SDK Import**: Currently imports directly from source `.ts` files in the browser.

### Suggested Enhancements
1.  **Real-time WebSockets**: Implement Socket.io in the Proxy to push logs to the Dashboard instantly without polling.
2.  **Advanced Redaction**: Use PII detection libraries to redact names and addresses from logs automatically.
3.  **Multi-Cloud Failover**: Implement logic in `ProviderFactory` to automatically retry a failed Stripe call via Razorpay.
4.  **Aether UI Components**: Create pre-built React/Vue components for the Bridges (e.g., `<AetherPayButton />`).

## ❓ Frequently Asked Questions

**Q: How do I add a new payment provider?**
A: Implement the `IPaymentAdapter` interface in `adapters/` and register it in `proxy/factory.ts`.

**Q: Is it safe to store keys in .env?**
A: Yes, as long as the Proxy server is deployed in a secure environment. The SDK client never sees these keys.
