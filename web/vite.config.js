import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    fs: {
      allow: [
        '..', // Allow serving files from one level up (where sdk is)
        '../../sdk'
      ]
    }
  }
});
