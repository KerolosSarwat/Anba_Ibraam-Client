import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3000',
        target: 'https://anbaibraam-server-production.up.railway.app/',
        changeOrigin: true,
      }
    }
  }
})
