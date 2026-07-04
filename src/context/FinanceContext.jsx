import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const { token }                       = useAuth()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets]           = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!token) {
      setTransactions([])
      setBudgets([])
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      try {
        const [txRes, budgetRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/budgets')
        ])
        setTransactions(txRes.data)
        setBudgets(budgetRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Derived values
  const totalIncome  = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name, value
  }))

  async function addTransaction(newTx) {
    try {
      const res = await api.post('/transactions', newTx)
      setTransactions(prev => [res.data, ...prev])
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  async function deleteTransaction(id) {
    try {
      await api.delete(`/transactions/${id}`)
      setTransactions(prev => prev.filter(t => t._id !== id))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  async function saveBudget(category, limit) {
    try {
      const res = await api.post('/budgets', { category, limit })
      setBudgets(prev => {
        const exists = prev.find(b => b.category === category)
        if (exists) return prev.map(b => b.category === category ? res.data : b)
        return [...prev, res.data]
      })
    } catch (error) {
      console.error('Failed to save budget:', error)
    }
  }

  async function saveBulkBudgets(budgetList) {
    try {
      const res = await api.post('/budgets/bulk', { budgets: budgetList })
      setBudgets(res.data)
    } catch (error) {
      console.error('Failed to save budgets:', error)
    }
  }

  async function deleteBudget(id) {
    try {
      await api.delete(`/budgets/${id}`)
      setBudgets(prev => prev.filter(b => b._id !== id))
    } catch (error) {
      console.error('Failed to delete budget:', error)
    }
  }

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, loading,
      totalIncome, totalExpense, balance,
      chartData,
      addTransaction, deleteTransaction,
      saveBudget, saveBulkBudgets, deleteBudget
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}