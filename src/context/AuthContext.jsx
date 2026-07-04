import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('finora_token') || null)

  function login(userData, authToken, isNew = false) {
    setUser({ ...userData, isNew })
    setToken(authToken)
    localStorage.setItem('finora_token', authToken)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('finora_token')
    localStorage.removeItem('finora_onboarded')
  }

  function completeOnboarding() {
    setUser(prev => ({ ...prev, isNew: false }))
    localStorage.setItem('finora_onboarded', 'true')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}