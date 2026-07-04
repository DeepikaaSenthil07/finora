import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import { useFinance } from '../context/FinanceContext'
import styles from './Budget.module.css'

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Bills: '📄', Salary: '💼', Freelance: '💻', Other: '📦'
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other']

function getProgressColor(pct) {
  if (pct >= 90) return '#FF6B6B'
  if (pct >= 70) return '#FFB347'
  return 'var(--accent)'
}

function StatusBadge({ pct }) {
  if (pct >= 90) return <span className={`${styles.statusBadge} ${styles.danger}`}>⚠ Over limit</span>
  if (pct >= 70) return <span className={`${styles.statusBadge} ${styles.warning}`}>⚡ Getting close</span>
  return <span className={`${styles.statusBadge} ${styles.safe}`}>✓ On track</span>
}

function AddModal({ onClose, onAdd }) {
  const [category, setCategory] = useState('Food')
  const [limit, setLimit]       = useState('')
  const [error, setError]       = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      setError('Please enter a valid budget amount.')
      return
    }
    onAdd({ category, limit: Number(limit) })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Set Budget</h2>

        {error && (
          <p style={{ color: '#CC0000', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="limit">Monthly Budget (₹)</label>
            <input
              id="limit"
              type="number"
              placeholder="e.g. 3000"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              min="1"
            />
          </div>

          <div className={styles.modalBtns}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Budget() {
  // ✅ budgets now comes from MongoDB via FinanceContext — no hardcoded defaults
  const { transactions, budgets, loading, saveBudget } = useFinance()
  const [showModal, setShowModal] = useState(false)

  // ✅ Only declared once
  const spendingByCategory = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      }, {})
  }, [transactions])

  // ✅ Only declared once — calls saveBudget from context (saves to MongoDB)
  function handleAddBudget(newBudget) {
    saveBudget(newBudget.category, newBudget.limit)
  }

  // ✅ Only declared once
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent    = budgets.reduce((sum, b) => sum + (spendingByCategory[b.category] || 0), 0)
  const totalLeft     = totalBudgeted - totalSpent

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p style={{ color: 'var(--text-muted)', marginTop: '40px' }}>Loading budgets…</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Budget</h1>
            <p className={styles.subtitle}>Track your monthly spending limits</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            + Set Budget
          </button>
        </div>

        {/* ── Summary ── */}
        <div className={`${styles.summaryCard} glass-card`}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Overview</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Total Budgeted</p>
              <p className={styles.summaryValue} style={{ color: 'var(--primary)' }}>
                ₹{totalBudgeted.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Total Spent</p>
              <p className={styles.summaryValue} style={{ color: '#FF6B6B' }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Remaining</p>
              <p className={styles.summaryValue} style={{ color: 'var(--accent)' }}>
                ₹{totalLeft.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Budget cards ── */}
        <div className={styles.budgetGrid}>
          {budgets.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</p>
              <p>No budgets set yet — click "+ Set Budget" to get started!</p>
            </div>
          ) : (
            budgets.map(budget => {
              const spent = spendingByCategory[budget.category] || 0
              const pct   = Math.min(Math.round((spent / budget.limit) * 100), 100)
              const color = getProgressColor(pct)
              const left  = Math.max(budget.limit - spent, 0)

              return (
                <div key={budget._id} className={`${styles.budgetCard} glass-card`}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardLeft}>
                      <div className={styles.categoryIcon}>
                        {CATEGORY_ICONS[budget.category] || '📦'}
                      </div>
                      <div>
                        <p className={styles.categoryName}>{budget.category}</p>
                        <p className={styles.categorySpent}>
                          ₹{spent.toLocaleString('en-IN')} spent
                        </p>
                      </div>
                    </div>
                    <span className={styles.budgetLimit}>
                      ₹{budget.limit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <div className={styles.progressLabels}>
                      <span>{pct}% used</span>
                      <span>₹{left.toLocaleString('en-IN')} left</span>
                    </div>
                  </div>

                  <StatusBadge pct={pct} />
                </div>
              )
            })
          )}
        </div>
      </main>

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddBudget}
        />
      )}
    </div>
  )
}

export default Budget
