export class FailoverEngine {
    static createProxy<T extends object>(primary: T, secondary: T, bridgeName: string): T {
        return new Proxy(primary, {
            get(target, prop) {
                const originalMethod = target[prop];
                if (typeof originalMethod !== 'function') return originalMethod;

                return async (...args: any[]) => {
                    try {
                        return await originalMethod.apply(target, args);
                    } catch (error) {
                        console.warn(`\x1b[31m[FAILOVER] Primary ${bridgeName} failed. Attempting secondary...\x1b[0m`);
                        
                        try {
                            const secondaryMethod = secondary[prop];
                            const result = await secondaryMethod.apply(secondary, args);
                            
                            // Return a special object that indicates success via failover
                            return { ...result, _aether_status: 'failover_success' };
                        } catch (secError) {
                            throw secError;
                        }
                    }
                };
            }
        });
    }
}
