# 🌌 AetherBridge

**The Final Integration You’ll Ever Write.**

AetherBridge is a high-performance, universal API translation layer designed to eliminate integration friction. Instead of wrestling with fragmented SDKs, you write code against the **Aether Standard**.

---

## 🚀 Key Features

- **Standardized Interfaces**: One method signature for all providers (Stripe, Twilio, AWS, etc.).
- **Shadow Kernel**: Local development mocking engine. Develop offline with zero API keys.
- **Smart Routing**: Intelligent proxy that switches providers based on cost, health, or latency.
- **The "Eject" Command**: Zero vendor lock-in. Convert Aether calls to native provider code anytime.
- **Time Machine Replay**: Record production errors and replay them in your local Shadow Kernel.
- **Config-Driven Architecture**: Switch between local Shadow Kernel and real providers (Stripe, Twilio) via `aether-config.yaml`.

---


### Environment Variables
For production mode, ensure the following are set:
- `STRIPE_SECRET_KEY`: Your live Stripe secret.
- `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`: Your live Twilio credentials.
- `PORT`: The port for the proxy server.

## 🛠 Directory Structure

```text
/aetherbridge-root
├── /contracts        # Shared TypeScript Interfaces
├── /adapters         # Provider implementations (Shadow, Stripe, etc.)
├── /sdk              # The client-side library (NPM package)
├── /proxy            # The Production Bridge (Express/Node.js)
├── /web              # Landing Page & Dashboard (Vite + Vanilla CSS)
└── aether-config.yaml # Routing & Provider Configuration
```

---

## 📦 Quick Start

### 1. Install the SDK
```bash
npm install @aetherbridge/sdk
```

### 2. Initialize
```typescript
import { bridge } from '@aetherbridge/sdk';

// This works regardless of the provider!
const user = await bridge.auth.signUp('user@example.com', 'password123');
```

---

## 🛡 Shadow Kernel (Local Dev)
When `NODE_ENV=development`, AetherBridge automatically routes calls to the local Shadow Kernel. It intercepts API calls and returns mock data, logging the interaction to your terminal.

---

## 📜 Legal
- [Privacy Policy](web/public/privacy.html)
- [Terms of Service](web/public/terms.html)

---

## ⚖ License
MIT © 2026 AetherBridge.
