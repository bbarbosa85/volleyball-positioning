import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { sqlitePlugin } from './src/server/sqlitePlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), sqlitePlugin()],
})
