import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('aether')
  .description('AetherBridge CLI - Unified Infrastructure Layer')
  .version('1.0.0');

program
  .command('init')
  .description('Scaffold AetherBridge configuration and environment')
  .action(() => {
    console.log('\x1b[35m[Aether Init]\x1b[0m Scaffolding project...');
    
    const configPath = path.join(process.cwd(), 'aether-config.yaml');
    const envPath = path.join(process.cwd(), '.env');

    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        mode: 'development',
        services: {
          auth: { provider: 'shadow' },
          payments: { provider: 'shadow' },
          notifications: { provider: 'shadow' },
          storage: { provider: 'shadow' },
          data: { provider: 'shadow' },
          ai: { provider: 'shadow' }
        }
      };
      fs.writeFileSync(configPath, yaml.dump(defaultConfig));
      console.log(' - Created aether-config.yaml');
    }

    if (!fs.existsSync(envPath)) {
      const defaultEnv = `# AetherBridge Environment\nPORT=3000\nSTRIPE_SECRET_KEY=\nSUPABASE_URL=\nSUPABASE_KEY=\nTWILIO_SID=\nTWILIO_TOKEN=\nTWILIO_FROM=\nAWS_ACCESS_KEY=\nAWS_SECRET_KEY=\nAWS_REGION=\nAWS_BUCKET=\nGEMINI_API_KEY=\n`;
      fs.writeFileSync(envPath, defaultEnv);
      console.log(' - Created .env');
    }

    console.log('\x1b[32mSuccess!\x1b[0m Run "aether shadow" to start local development.');
  });

program
  .command('shadow')
  .description('Start the local Shadow Kernel (Proxy Server)')
  .action(() => {
    console.log('\x1b[36m[Aether Shadow]\x1b[0m Starting local interceptor...');
    try {
      execSync('npm run dev:proxy', { stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to start proxy. Ensure you are in the project root.');
    }
  });

program
  .command('doctor')
  .description('Check for missing keys or misconfigured adapters')
  .action(() => {
    console.log('\x1b[33m[Aether Doctor]\x1b[0m Diagnosing system...');
    const configPath = path.join(process.cwd(), 'aether-config.yaml');
    if (!fs.existsSync(configPath)) {
      console.error('Error: aether-config.yaml not found. Run "aether init" first.');
      return;
    }

    const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as any;
    console.log(`Current Mode: ${config.mode}`);
    
    // Perform simple validation
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    Object.entries(config.services).forEach(([name, service]: [string, any]) => {
      console.log(`Checking ${name} (${service.provider})...`);
      if (service.provider === 'shadow') {
        console.log(' \x1b[32m[OK]\x1b[0m Shadow mode active.');
      } else {
        // Mock check for keys
        console.log(' \x1b[33m[WARN]\x1b[0m Production provider detected. Ensure keys are in .env.');
      }
    });
  });

program.parse();
