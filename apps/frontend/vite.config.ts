import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/logos': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/avatars': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/documents': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
