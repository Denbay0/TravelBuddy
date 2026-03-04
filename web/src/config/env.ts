const DEFAULT_API_BASE_URL = '/'
const DEFAULT_MEDIA_BASE_URL = '/'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  mediaBaseUrl: import.meta.env.VITE_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL,
  geoapifyMapKey: import.meta.env.VITE_GEOAPIFY_MAP_KEY || '',
  geoapifyStyleUrl: import.meta.env.VITE_GEOAPIFY_STYLE_URL || '',
  adminLogin: import.meta.env.VITE_ADMIN_LOGIN || 'admin',
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin',
}
