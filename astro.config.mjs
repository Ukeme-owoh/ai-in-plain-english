import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://ukeme-owoh.github.io',
  base: '/ai-in-plain-english',
  integrations: [mdx()],
});
