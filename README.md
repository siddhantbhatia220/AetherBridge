# 🌌 AetherBridge

**The Final Integration You’ll Ever Write.**

AetherBridge is a high-performance, universal API translation layer designed to eliminate integration friction. Instead of wrestling with fragmented SDKs, you write code against the **Aether Standard**.

---

## 🚀 Key Features

- **Standardized Interfaces**: One method signature for all providers (Stripe, Twilio, AWS, etc.).
- **Shadow Kernel**: Local development mocking engine. Develop offline with zero API keys.
- **Smart Routing**: Intelligent proxy that switches providers based on cost, health, or latency.
- **The "Eject" Command**: Zero vendor lock-in. Advanced AST-based code transformation removes Aether calls safely.
- **Time Machine Replay**: Persistent request logging via SQLite. Replay production errors anytime.
- **Config-Driven Architecture**: Switch between local Shadow Kernel and real providers (Stripe, Twilio, Supabase, AWS S3).

---

## 🛠 Production Readiness

AetherBridge is 100% real-world compatible. Set `mode: production` in `aether-config.yaml` to activate high-performance SDKs.

### Environment Variables
For production mode, set the following:
- **Payments**: `STRIPE_SECRET_KEY`
- **Auth**: `SUPABASE_URL`, `SUPABASE_KEY`
- **Notifications**: `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`
- **Storage**: `AWS_REGION`, `AWS_BUCKET`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`

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
