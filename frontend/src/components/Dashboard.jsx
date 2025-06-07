import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ClientsPage } from './pages/ClientsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SubmissionsPage } from './pages/SubmissionsPage'
import { UsersPage } from './pages/UsersPage'
import { SettingsPage } from './pages/SettingsPage'

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Redirect to analytics if on root path
    if (location.pathname === '/') {
      navigate('/analytics')
    }
  }, [location.pathname, navigate])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            {user?.has_permission?.('create_users') && (
              <Route path="/users" element={<UsersPage />} />
            )}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

