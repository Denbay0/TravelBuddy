import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const projectDir = fileURLToPath(new URL('..', import.meta.url))

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const projectEnv = loadEnv(mode, projectDir, '')

  const backendPort =
    env.BACKEND_PORT || process.env.BACKEND_PORT || projectEnv.BACKEND_PORT || '8000'
  const devProxyTarget =
    env.VITE_DEV_PROXY_TARGET ||
    process.env.VITE_DEV_PROXY_TARGET ||
    `http://127.0.0.1:${backendPort}`

  const allowedHosts = (
    env.VITE_ALLOWED_HOSTS ||
    process.env.VITE_ALLOWED_HOSTS ||
    projectEnv.VITE_ALLOWED_HOSTS ||
    '127.0.0.1,localhost'
  )
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)

  return {
    envDir: rootDir,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts,
      proxy: Object.fromEntries(
        proxyPaths.map((path) => [
          path,
          {
            target: devProxyTarget,
            changeOrigin: true,
          },
        ]),
      ),
    },
  }
})
