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
import InfoPage from './pages/InfoPage.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx'
import AdminPostsPage from './pages/admin/AdminPostsPage.tsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx'
import AdminAdminsPage from './pages/admin/AdminAdminsPage.tsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx'
import { AdminRouteAccess } from './features/auth/AdminRouteAccess.tsx'

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
              <Route path="about" element={<InfoPage title="О продукте" />} />
              <Route path="blog" element={<InfoPage title="Блог" />} />
              <Route path="policy" element={<InfoPage title="Политика" />} />
              <Route path="terms" element={<InfoPage title="Условия" />} />
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/admin" element={<AdminRouteAccess />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="posts" element={<AdminPostsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="admins" element={<AdminAdminsPage />} />
                <Route path="login" element={<AdminLoginPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
