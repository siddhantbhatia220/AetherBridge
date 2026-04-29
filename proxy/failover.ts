/**
 * The FailoverEngine is a higher-order wrapper for Aether Adapters.
 * It ensures that if a primary service (e.g. Stripe) fails, the request
 * is automatically and transparently rerouted to a secondary provider (e.g. PayPal).
 */

export class FailoverEngine {
    /**
     * Wraps a primary and secondary adapter with failover logic.
     * @param primary The primary adapter instance
     * @param secondary The secondary (backup) adapter instance
     * @param bridgeName Name of the bridge for logging (e.g. 'payments')
     */
    static createProxy<T extends object>(primary: T, secondary: T, bridgeName: string): T {
        return new Proxy(primary, {
            get(target, prop) {
                const originalMethod = target[prop];
                if (typeof originalMethod !== 'function') return originalMethod;

                return async (...args: any[]) => {
                    try {
                        // Attempt Primary
                        return await originalMethod.apply(target, args);
                    } catch (error) {
                        console.warn(`\x1b[31m[FAILOVER]\x1b[0m Primary provider for ${bridgeName} failed. Attempting failover...`);
                        console.error(error);

                        try {
                            // Attempt Secondary
                            const secondaryMethod = secondary[prop];
                            if (typeof secondaryMethod !== 'function') {
                                throw new Error(`Secondary provider does not implement ${String(prop)}`);
                            }
                            const result = await secondaryMethod.apply(secondary, args);
                            console.log(`\x1b[32m[FAILOVER SUCCESS]\x1b[0m Request resolved via secondary provider.`);
                            return result;
                        } catch (secondaryError) {
                            console.error(`\x1b[31m[CRITICAL]\x1b[0m Both primary and secondary providers for ${bridgeName} failed.`);
                            throw secondaryError;
                        }
                    }
                };
            }
        });
    }
}
