import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Signup       from './pages/Signup'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget       from './pages/Budget'
import Profile from './pages/Profile'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <Routes>
            <Route path="/"             element={<Landing />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/signup"       element={<Signup />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget"       element={<Budget />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App