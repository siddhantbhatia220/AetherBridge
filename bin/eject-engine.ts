import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

export async function runEject(targetDir: string) {
    const project = new Project();
    project.addSourceFilesAtPaths(path.join(targetDir, '**/*.ts'));

    console.log(`\x1b[35m[EJECT ENGINE]\x1b[0m Scanning ${project.getSourceFiles().length} files...`);

    project.getSourceFiles().forEach(sourceFile => {
        let changed = false;

        // 1. Find Aether SDK imports
        const aetherImport = sourceFile.getImportDeclaration(i => i.getModuleSpecifierValue() === '@aether/sdk');
        
        if (aetherImport) {
            console.log(` - Transforming: ${sourceFile.getBaseName()}`);
            
            // 2. Replace with Stripe/Supabase imports (Mock replacement logic)
            aetherImport.setModuleSpecifier('stripe');
            aetherImport.getNamedImports().forEach(ni => ni.setName('Stripe'));
            
            // 3. Find bridge calls and transform them
            sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
                const text = call.getText();
                if (text.includes('bridge.pay.initializePayment')) {
                    call.replaceWithText(`stripe.paymentIntents.create(${call.getArguments().map(a => a.getText()).join(', ')})`);
                    changed = true;
                }
            });

            if (changed) {
                sourceFile.saveSync();
            }
        }
    });

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Source code has been "Ejected" to native SDK calls.`);
}
