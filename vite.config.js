import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages project site: https://<owner>.github.io/<repo>/
export default defineConfig({
  plugins: [react()],
  base: '/hospital-tracking-visualization/',
  server: {
    host: true,
    port: 5173,
  },
})
