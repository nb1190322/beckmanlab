import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['courtesy-skiing-essays-certification.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:5000',
      '/callback': 'http://localhost:5000',
    },
  },
})