# Developer Implementation Guide

This guide shows how you as a developer can use our product AetherBridge in their own application, and how the **Failover Engine** provides peace of mind.

## 1. Minimal Integration Code
A developer only needs to import the `bridge` and call the standardized methods.

```typescript
// app.ts
import { bridge } from '@aether/sdk';

async function handleCheckout(amount: number, userEmail: string) {
    try {
        console.log("🚀 Initializing checkout via AetherBridge...");

        // 1. Initialize Payment (Standardized regardless of provider)
        const payment = await bridge.pay.initializePayment({ 
            amount, 
            currency: 'USD' 
        });

        // 2. Send Confirmation (Standardized SMS/Email)
        await bridge.notifications.sendSMS({
            to: '+1234567890',
            message: `Your order for $${amount} is confirmed. ID: ${payment.id}`
        });

        return payment;
    } catch (error) {
        // AetherBridge handles provider-specific errors internally
        console.error("Critical failure in bridge call:", error.message);
    }
}
```

## 2. Why the Failover Engine is a Game Changer

Without AetherBridge, if Stripe goes down, your app stops taking money until you manually rewrite your code for PayPal. 

With AetherBridge **Failover Engine**, you simply update your config:

```yaml
# aether-config.yaml
services:
  payments:
    provider: stripe
    secondary: paypal  # If Stripe fails, AetherBridge switches to PayPal automatically
```

### The Failover Flow:
1.  Developer calls `bridge.pay.initializePayment()`.
2.  Stripe returns a `500 Internal Server Error`.
3.  **Failover Engine** catches the error.
4.  It instantly reroutes the *exact same request* to PayPal.
5.  The app receives a successful `paymentId` without the developer ever knowing there was a crisis.

## 3. Benefits Summary
- **Resilience**: Your app stays alive even when global cloud providers fail.
- **Speed**: Build features in minutes using the local **Shadow Kernel**.
- **No Refactoring**: Switch providers by editing a YAML file, not your source code.
