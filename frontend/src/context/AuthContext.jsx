import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import jwt_decode from 'jwt-decode'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const buildUser = useCallback((decoded, storedUser = {}) => ({
    id: decoded.id,
    role: decoded.role,
    department: decoded.department,
    name: storedUser.name || decoded.name,
    email: storedUser.email || decoded.email,
    hasCompletedOnboarding: storedUser.hasCompletedOnboarding,
    mustChangePassword: storedUser.mustChangePassword,
    registrationNumber: storedUser.registrationNumber,
  }), [])

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('authToken')
    if (storedToken) {
      try {
        const decoded = jwt_decode(storedToken)
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setToken(storedToken)
        setUser(buildUser(decoded, storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [buildUser])

  const login = (userData, newToken) => {
    localStorage.setItem('token', newToken)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    const decoded = jwt_decode(newToken)
    setToken(newToken)
    setUser(buildUser(decoded, userData || {}))
  }

  const updateUser = (newUserData) => {
    setUser(prev => {
      const updated = { ...prev, ...newUserData }
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...newUserData }))
      return updated
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
