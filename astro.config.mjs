import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL: set it in Cloudflare Pages (or .env) once the domain is chosen.
export default defineConfig({
  site: process.env.SITE_URL || 'https://meheedihasaan.github.io',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
