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

console.log('[AetherBridge] Eject complete. Your code is now native.');
