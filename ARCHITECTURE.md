# AetherBridge Technical Architecture

This document outlines the internal mechanics of AetherBridge and how it achieves provider-agnosticism.

## 🧱 The Three-Tier System

### 1. The Contract Tier (`/contracts`)
The source of truth. We define TypeScript interfaces for every bridge category. 
- `IAuthAdapter`: signUp, signIn, signOut.
- `IPaymentAdapter`: initializePayment, handleWebhook.
- `IAIBridge`: summarize, analyze, generate.

### 2. The Adapter Tier (`/adapters`)
Concrete implementations of the contracts.
- **Shadow Adapters**: Local mocks using SQLite for persistence.
- **Production Adapters**: Wrappers around native SDKs (Stripe, Supabase, Twilio).

### 3. The Proxy Tier (`/proxy`)
The central nervous system.
- **Factory**: Dynamically instantiates the correct adapter based on `aether-config.yaml`.
- **Sanitizer**: Redacts `clientSecret`, `token`, and `apiKey` from all logs.
- **Routes**: Standardized endpoints that the SDK communicates with.

## 🛰️ Request Lifecycle

1.  **SDK Call**: `aether.auth.signUp(email, password)`
2.  **Standardization**: SDK packages the call into a `POST` request to `http://localhost:3000/auth/signup`.
3.  **Proxy Reception**: The Proxy receives the request and identifies the service as `auth`.
4.  **Factory Resolution**: `ProviderFactory` checks `aether-config.yaml`. It sees `auth: { provider: 'shadow' }`.
5.  **Adapter Execution**: `ShadowAuthAdapter.signUp()` is called. It writes to the local DB and returns a JWT.
6.  **Redaction**: The `sanitize` utility scrubs the logs.
7.  **Response**: The user receives a standard user object.

## 🛡️ Security & Privacy
- **No Keys in Client**: All API keys stay on the Proxy (Server-side). The frontend never sees a Stripe Secret Key.
- **Auto-Redaction**: Every log entry is passed through a regex-based scrubber that recognizes sensitive patterns.

## 🚀 Future Roadmap
- **Edge Proxy**: Deploy the proxy as a Cloudflare Worker for <10ms latency.
- **Visual Ejector**: A GUI that shows you the code changes before applying the `eject` command.
- **Community Hub**: A repository for sharing custom adapters.
