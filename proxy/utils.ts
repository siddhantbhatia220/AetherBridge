/**
 * AetherBridge Security & Stability Utilities
 */

export const REQUIRED_KEYS = {
    stripe: ['STRIPE_SECRET_KEY'],
    supabase: ['SUPABASE_URL', 'SUPABASE_KEY'],
    twilio: ['TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_FROM'],
    s3: ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_REGION', 'AWS_BUCKET'],
    gemini: ['GEMINI_API_KEY']
};

export function sanitize(data: any) {
    if (!data) return data;
    
    // Pattern-based redaction (for strings)
    const secretPatterns = [
        /sk_live_[a-zA-Z0-9]{24,}/g,
        /sk_test_[a-zA-Z0-9]{24,}/g,
        /AIza[a-zA-Z0-9-_]{35}/g, 
        /SG\.[a-zA-Z0-9-_]{22}\.[a-zA-Z0-9-_]{43}/g
    ];

    // Key-based redaction (for objects)
    const sensitiveKeys = [
        'password', 'token', 'clientSecret', 'apiKey', 'secret', 
        'cvc', 'cardNumber', 'stripe_key', 'aws_secret'
    ];
    
    let json = JSON.stringify(data);
    secretPatterns.forEach(pattern => {
        json = json.replace(pattern, '[REDACTED_SECRET]');
    });

    const clean = JSON.parse(json);
    
    const redact = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
            if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
                redact(obj[key]);
            }
        }
    };
    
    redact(clean);
    return clean;
}

export function validateEnvironment(config: any) {
    const errors: string[] = [];
    
    if (config.mode === 'production') {
        Object.entries(config.services).forEach(([name, service]: [string, any]) => {
            if (service.provider !== 'shadow') {
                const keys = (REQUIRED_KEYS as any)[service.provider] || [];
                keys.forEach((key: string) => {
                    if (!process.env[key]) {
                        errors.push(`Missing [${key}] for production service: ${name} (${service.provider})`);
                    }
                });
            }
        });
    }
    
    if (errors.length > 0) {
        console.warn("\x1b[33m[PRE-FLIGHT WARNING] Configuration Issues Found:\x1b[0m");
        errors.forEach(err => console.warn(` - ${err}`));
        console.warn("\x1b[33mFalling back to Shadow Mode for missing services.\x1b[0m");
        return false;
    }
    
    console.log('\x1b[32m[PRE-FLIGHT]\x1b[0m All production keys verified.');
    return true;
}
