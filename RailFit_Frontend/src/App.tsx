import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

import './App.css'

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Assets = lazy(() => import('./pages/Assets/AssetList'))
const AssetDetail = lazy(() => import('./pages/Assets/AssetDetail'))
const Inspections = lazy(() => import('./pages/Inspections/InspectionList'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Alerts = lazy(() => import('./pages/Alerts/AlertList'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rail-light">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-primary">Loading...</div>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rail-light">
        <div className="text-center">

          <div className="text-xl font-semibold text-primary">Loading RailFIT...</div>
          <div className="text-sm text-rail-gray mt-2">Railway Asset Management System</div>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Main App Layout
function AppLayout() {
  const { handleLogout } = useAuth()

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <main className="min-h-screen bg-rail-light">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />

          </Routes>
        </Suspense>
      </main>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
