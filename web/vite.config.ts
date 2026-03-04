import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_PROXY_TARGET =
  process.env.VITE_DEV_PROXY_TARGET || 'http://backend:8000'

const ALLOWED_HOSTS = (process.env.VITE_ALLOWED_HOSTS || '127.0.0.1,localhost')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

const proxyPaths = [
  '/auth',
  '/api/admin',
  '/profile',
  '/routes',
  '/posts',
  '/users',
  '/search',
  '/reports',
  '/media',
  '/maps',
]

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ALLOWED_HOSTS,
    proxy: Object.fromEntries(
      proxyPaths.map((path) => [
        path,
        {
          target: DEV_PROXY_TARGET,
          changeOrigin: true,
        },
      ]),
    ),
  },
})