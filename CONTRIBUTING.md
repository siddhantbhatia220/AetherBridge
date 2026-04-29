# Contributing to AetherBridge

Thank you for wanting to expand the AetherBridge ecosystem! The goal of this project is to create a universal interface for all cloud services.

## Writing a New Adapter

To write a new adapter, follow these steps:

1.  **Check the Contract**: Look at the corresponding file in `contracts/` (e.g., `contracts/payments.ts`). Your adapter MUST implement this interface.
2.  **Create the File**: Create a new file in `adapters/` named after the provider (e.g., `adapters/payments-razorpay.ts`).
3.  **Implement the Class**:
    ```typescript
    import { IPaymentAdapter, PaymentSession } from '../contracts/payments.js';

    export class RazorpayAdapter implements IPaymentAdapter {
        constructor(private apiKey: string, private secret: string) {}

        async initializePayment(amount: number, currency: string) {
            // Your logic here
        }
        // ...
    }
    ```
4.  **Register in Factory**: Update `proxy/factory.ts` to include your new adapter in the corresponding `create...` method.

## Plugin Support (Coming Soon)
We are moving towards a dynamic plugin architecture where adapters can be dropped into the `plugins/` folder without modifying the core factory.

## Testing
Always test your adapter by adding it to the `aether-config.yaml` in a test project and ensuring it handles errors gracefully.
