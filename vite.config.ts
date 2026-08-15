import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Avoid browser CORS during local dev for public job APIs
      '/api/arbeitnow': {
        target: 'https://www.arbeitnow.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arbeitnow/, '/api/job-board-api'),
      },
      '/api/adzuna': {
        target: 'https://api.adzuna.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adzuna/, ''),
      },
    },
  },
})
