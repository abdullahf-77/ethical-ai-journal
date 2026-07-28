import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://<user>.github.io/ethical-ai-journal/ in production
// (GitHub Pages project site), so assets must resolve under that subpath.
// Override with VITE_BASE for local builds or a different host.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/ethical-ai-journal/',
  plugins: [react(), tailwindcss()],
})
