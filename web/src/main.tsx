import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import HomePage from './pages/HomePage.tsx'
import RoutesPage from './pages/RoutesPage.tsx'
import CommunityPage from './pages/CommunityPage.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { GuestOnlyRoute } from './features/auth/GuestOnlyRoute.tsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.tsx'
import { ThemeProvider } from './features/theme/ThemeContext.tsx'
import AboutPage from './pages/AboutPage.tsx'
import BlogPage from './pages/BlogPage.tsx'
import PolicyPage from './pages/PolicyPage.tsx'
import TermsPage from './pages/TermsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="policy" element={<PolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
