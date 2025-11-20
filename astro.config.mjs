import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import auth from 'auth-astro';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [tailwind(), auth()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
});
