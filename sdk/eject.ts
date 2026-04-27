import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

/**
 * AetherBridge Advanced Eject CLI (AST Powered)
 * Uses ts-morph to safely transform bridge calls into native SDK calls.
 */

const project = new Project();
const targetDir = process.argv[2] || './src';

console.log(`[AetherBridge] AST Eject initialized. Scanning ${targetDir}...`);

project.addSourceFilesAtPaths(path.join(targetDir, '**/*.ts'));

project.getSourceFiles().forEach(sourceFile => {
    let changed = false;

    // Find all CallExpressions (e.g., bridge.pay.initializePayment(...))
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const text = call.getExpression().getText();

        // Transformation Map
        if (text === 'bridge.pay.initializePayment') {
            call.getExpression().replaceWithText('stripe.paymentIntents.create');
            changed = true;
        } else if (text === 'bridge.auth.signUp') {
            call.getExpression().replaceWithText('supabase.auth.signUp');
            changed = true;
        } else if (text === 'bridge.notify.sendSMS') {
            call.getExpression().replaceWithText('twilio.messages.create');
            changed = true;
        }
    });

    if (changed) {
        console.log(`[EJECT] Successfully transformed: ${sourceFile.getBaseName()}`);
        sourceFile.saveSync();
    }
});

// Generate Migration Report
const reportPath = path.join(process.cwd(), 'MIGRATION_REPORT.md');
const reportContent = `
# 🛠 AetherBridge Migration Report
Generated on: ${new Date().toLocaleString()}

## 🔑 Required Native Environment Variables
Since you have ejected to native SDKs, ensure you rename your Aether variables to the following:

| Service | Native Variable | Source Variable |
| :--- | :--- | :--- |
| **Stripe** | \`STRIPE_SECRET_KEY\` | \`STRIPE_SECRET_KEY\` |
| **Supabase** | \`SUPABASE_URL\`, \`SUPABASE_KEY\` | \`SUPABASE_URL\`, \`SUPABASE_KEY\` |
| **Twilio** | \`TWILIO_ACCOUNT_SID\`, \`TWILIO_AUTH_TOKEN\` | \`TWILIO_SID\`, \`TWILIO_TOKEN\` |

## 📦 Next Steps
1. Uninstall \`@aetherbridge/sdk\`.
2. Install native SDKs: \`npm install stripe @supabase/supabase-js twilio\`.
3. Update your provider initializations in the converted files.
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`[AetherBridge] Migration report generated: ${reportPath}`);
console.log('[AetherBridge] Eject complete. Your code is now native.');
