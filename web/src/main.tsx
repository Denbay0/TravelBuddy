import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'

function resolvePage() {
  if (window.location.pathname === '/login') {
    return <LoginPage />
  }

  if (window.location.pathname === '/register') {
    return <RegisterPage />
  }

  if (window.location.pathname === '/profile') {
    return <ProfilePage />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {resolvePage()}
  </StrictMode>,
)
