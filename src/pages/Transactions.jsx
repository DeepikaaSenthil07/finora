import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import { useFinance } from '../context/FinanceContext'
import styles from './Transactions.module.css'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Salary', 'Freelance', 'Other']

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Bills: '📄', Salary: '💼', Freelance: '💻', Other: '📦'
}

// ── Add Transaction Modal ──
function AddModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.description || !formData.amount) {
      setError('Please fill in description and amount.')
      return
    }
    if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    onAdd({
      ...formData,
      amount: Number(formData.amount)
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Transaction</h2>

        {error && (
          <p style={{ color: '#CC0000', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Type</label>
            <div className={styles.typeToggle}>
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.typeBtn} ${formData.type === t ? styles.typeBtnActive : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                >
                  {t === 'income' ? '📈 Income' : '📉 Expense'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="e.g. Zomato order"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="e.g. 450"
              value={formData.amount}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className={styles.modalBtns}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Transactions page ──
function Transactions() {
  // ✅ All hooks at the top — always
  const { transactions, loading, addTransaction, deleteTransaction } = useFinance()
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)

  // ✅ useMemo after useState
  const filtered = useMemo(() => {
    return transactions
      .filter(tx => filter === 'all' || tx.type === filter)
      .filter(tx =>
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      )
  }, [transactions, filter, search])

  // ✅ Functions after hooks
  function handleDelete(id) {
    if (window.confirm('Delete this transaction? This cannot be undone.')) {
      deleteTransaction(id)
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p style={{ color: 'var(--text-muted)', marginTop: '40px' }}>Loading transactions…</p>
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
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.subtitle}>{filtered.length} transactions found</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            + Add Transaction
          </button>
        </div>

        {/* ── Filters ── */}
        <div className={styles.filters}>
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Transaction list ── */}
        <div className={`${styles.listCard} glass-card`}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <p>🔍</p>
              <p>No transactions found</p>
            </div>
          ) : (
            filtered.map((tx, index) => (
              <div key={tx._id}>
                <div className={styles.txItem}>
                  <div className={styles.txLeft}>
                    <div
                      className={styles.txIcon}
                      style={{
                        background: tx.type === 'income'
                          ? 'rgba(0,200,150,0.1)'
                          : 'rgba(255,107,107,0.1)'
                      }}
                    >
                      {CATEGORY_ICONS[tx.category] || '📦'}
                    </div>
                    <div>
                      <p className={styles.txDesc}>{tx.description}</p>
                      <p className={styles.txMeta}>{tx.category}</p>
                    </div>
                  </div>
                  <div className={styles.txRight}>
                    <span
                      className={styles.txAmount}
                      style={{ color: tx.type === 'income' ? 'var(--accent)' : '#FF6B6B' }}
                    >
                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <p className={styles.txDate}>{tx.date}</p>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(tx._id)}
                    title="Delete transaction"
                  >
                    🗑
                  </button>
                </div>
                {index < filtered.length - 1 && <div className={styles.divider} />}
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdd={addTransaction}
        />
      )}
    </div>
  )
}

export default Transactions
