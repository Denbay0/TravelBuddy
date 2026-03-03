import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_PROXY_TARGET = process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': {
        target: DEV_PROXY_TARGET,
        changeOrigin: false,
      },
      '/profile': {
        target: DEV_PROXY_TARGET,
        changeOrigin: false,
      },
      '/media': {
        target: DEV_PROXY_TARGET,
        changeOrigin: false,
      },
    },
  },
})
