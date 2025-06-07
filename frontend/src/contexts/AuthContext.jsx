import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Make sure to get the API URL from environment variables
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  
  // Log the API base URL to help with debugging
  console.log('API Base URL:', API_BASE)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...')
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Auth check response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth check data:', data)
        
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username, API_BASE })
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })
      
      console.log('Login response status:', response.status)
      
      // Get the response text first
      const responseText = await response.text()
      console.log('Login response text:', responseText)
      
      // Then try to parse it as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log('Login data:', data)
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        return { 
          success: false, 
          error: 'Invalid response from server. Please try again.' 
        }
      }
      
      if (data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed. Please check your credentials.' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    API_BASE
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
