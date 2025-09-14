
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register.tsx'
import Assets from './pages/Assets/AssetList'
import AssetDetail from './pages/Assets/AssetDetail.tsx'
import Inspections from './pages/Inspections/InspectionList'
import Analytics from './pages/Analytics/AIAnalytics'
import Alerts from './pages/Alerts/AlertList'
import Settings from './pages/Settings/UserManagement'
import './App.css'

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
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
