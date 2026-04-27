/**
 * AetherBridge Security & Stability Utilities
 */

export const REQUIRED_KEYS = {
    stripe: ['STRIPE_SECRET_KEY'],
    supabase: ['SUPABASE_URL', 'SUPABASE_KEY'],
    twilio: ['TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_FROM'],
    s3: ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_REGION', 'AWS_BUCKET']
};

export function validateEnvironment(config) {
    const errors = [];
    
    if (config.mode === 'production') {
        Object.entries(config.services).forEach(([name, service]) => {
            if (service.provider !== 'shadow') {
                const keys = REQUIRED_KEYS[service.provider] || [];
                keys.forEach(key => {
                    if (!process.env[key]) {
                        errors.push(`Missing [${key}] for production service: ${name} (${service.provider})`);
                    }
                });
            }
        });
    }

    if (errors.length > 0) {
        console.error('\x1b[31m[PRE-FLIGHT VALIDATION FAILED]\x1b[0m');
        errors.forEach(err => console.error(`  - ${err}`));
        console.log('\n\x1b[33mTip:\x1b[0m Downgrade to "shadow" mode in aether-config.yaml to work offline.\n');
        return false;
    }

    console.log('\x1b[32m[PRE-FLIGHT]\x1b[0m All production keys verified.');
    return true;
}

export function sanitize(data) {
    if (!data) return data;
    const secretPatterns = [
        /sk_live_[a-zA-Z0-9]{24,}/g,
        /sk_test_[a-zA-Z0-9]{24,}/g,
        /AIza[a-zA-Z0-9-_]{35}/g, // Google Keys
        /SG\.[a-zA-Z0-9-_]{22}\.[a-zA-Z0-9-_]{43}/g // SendGrid
    ];

    let json = JSON.stringify(data);
    secretPatterns.forEach(pattern => {
        json = json.replace(pattern, '[REDACTED_SECRET]');
    });

    return JSON.parse(json);
}
