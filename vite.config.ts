import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// @fix: Manually defining __dirname because it is not available in ESM (ECMAScript Modules) by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isGithubPages = process.env.BUILD_FOR_GHPAGES === 'true' || process.env.GITHUB_ACTIONS === 'true';
    return {
      base: isGithubPages ? '/ogmhavay-netim/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        outDir: isGithubPages ? 'docs' : 'dist',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});