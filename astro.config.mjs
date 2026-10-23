import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Landing de perguntas + API route. Output server p/ Pages Functions (/api/pergunta).
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site: 'https://links.brunomedeiroseo.com.br',
});
