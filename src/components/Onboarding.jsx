import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import styles from './Onboarding.module.css'

const CATEGORIES = [
  { name: 'Food',      icon: '🍔', suggested: 3000 },
  { name: 'Transport', icon: '🚗', suggested: 1500 },
  { name: 'Shopping',  icon: '🛍️', suggested: 2000 },
  { name: 'Bills',     icon: '📄', suggested: 1000 },
  { name: 'Other',     icon: '📦', suggested: 500  },
]

const TOUR_STEPS = [
  {
    title: '📊 Dashboard',
    desc: 'Your financial command center. See your total balance, income, expenses, and charts, all updated in real time as you add transactions.',
    highlight: 'stat cards at the top'
  },
  {
    title: '💸 Transactions',
    desc: 'Log every income and expense here. Filter by type, search by description, and add new entries anytime with the + Add Transaction button.',
    highlight: 'transactions page'
  },
  {
    title: '🎯 Budget',
    desc: 'Track your monthly spending limits per category. Progress bars turn orange when you\'re close and red when you\'ve exceeded your budget.',
    highlight: 'budget page'
  },
  {
    title: '📈 Charts',
    desc: 'The bar chart shows your real income vs expenses month by month. The donut chart breaks down your spending by category automatically.',
    highlight: 'charts section'
  },
]

export default function Onboarding() {
  const { user, completeOnboarding }     = useAuth()
  const { saveBulkBudgets, addTransaction } = useFinance()

  const [step, setStep]       = useState(0)
  const [budgets, setBudgets] = useState(
    CATEGORIES.map(c => ({ ...c, limit: c.suggested, selected: true }))
  )
  const [txForm, setTxForm]   = useState({
    type: 'income', description: '', amount: '', category: 'Salary',
    date: new Date().toISOString().split('T')[0]
  })
  const [tourStep, setTourStep] = useState(0)
  const [saving, setSaving]     = useState(false)

  // Step 0 — Welcome
  // Step 1 — Set budgets
  // Step 2 — Add first transaction
  // Step 3 — Dashboard tour
  // Step 4 — Done

  async function handleBudgetNext() {
    setSaving(true)
    const selected = budgets
      .filter(b => b.selected)
      .map(b => ({ category: b.name, limit: b.limit }))
    await saveBulkBudgets(selected)
    setSaving(false)
    setStep(2)
  }

  async function handleTxNext() {
    if (txForm.description && txForm.amount && Number(txForm.amount) > 0) {
      await addTransaction({
        ...txForm,
        amount: Number(txForm.amount)
      })
    }
    setStep(3)
  }

  function handleTourNext() {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(t => t + 1)
    } else {
      completeOnboarding()
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* ── Progress dots ── */}
        <div className={styles.dots}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`${styles.dot} ${step >= i ? styles.dotActive : ''}`} />
          ))}
        </div>

        {/* ══ STEP 0 — Welcome ══ */}
        {step === 0 && (
          <div className={styles.stepWrap}>
            <div className={styles.welcomeEmoji}>👋</div>
            <h1 className={styles.welcomeTitle}>
              Welcome to Finora,<br />
              <span className={styles.userName}>{user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className={styles.welcomeDesc}>
              Let's get you set up in just 3 quick steps. We'll help you set your
              monthly budgets, log your first transaction, and show you around the dashboard.
            </p>
            <div className={styles.stepCards}>
              <div className={styles.stepCard}>
                <span>🎯</span>
                <span>Set budgets</span>
              </div>
              <div className={styles.stepCard}>
                <span>💸</span>
                <span>First transaction</span>
              </div>
              <div className={styles.stepCard}>
                <span>📊</span>
                <span>Dashboard tour</span>
              </div>
            </div>
            <button className={styles.primaryBtn} onClick={() => setStep(1)}>
              Let's get started →
            </button>
          </div>
        )}

        {/* ══ STEP 1 — Set budgets ══ */}
        {step === 1 && (
          <div className={styles.stepWrap}>
            <h2 className={styles.stepTitle}>🎯 Set your monthly budgets</h2>
            <p className={styles.stepDesc}>
              Choose which categories to track and set your monthly spending limit for each.
              You can always change these later.
            </p>
            <div className={styles.budgetList}>
              {budgets.map((b, i) => (
                <div key={b.name} className={`${styles.budgetRow} ${b.selected ? styles.budgetRowActive : ''}`}>
                  <div className={styles.budgetLeft}>
                    <input
                      type="checkbox"
                      checked={b.selected}
                      onChange={() => setBudgets(prev =>
                        prev.map((x, j) => j === i ? { ...x, selected: !x.selected } : x)
                      )}
                      className={styles.checkbox}
                    />
                    <span className={styles.budgetIcon}>{b.icon}</span>
                    <span className={styles.budgetName}>{b.name}</span>
                  </div>
                  <div className={styles.budgetRight}>
                    <span className={styles.rupee}>₹</span>
                    <input
                      type="number"
                      value={b.limit}
                      disabled={!b.selected}
                      onChange={e => setBudgets(prev =>
                        prev.map((x, j) => j === i ? { ...x, limit: Number(e.target.value) } : x)
                      )}
                      className={styles.limitInput}
                      min="1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.skipBtn} onClick={() => setStep(2)}>Skip for now</button>
              <button className={styles.primaryBtn} onClick={handleBudgetNext} disabled={saving}>
                {saving ? 'Saving…' : 'Save budgets →'}
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — First transaction ══ */}
        {step === 2 && (
          <div className={styles.stepWrap}>
            <h2 className={styles.stepTitle}>💸 Log your first transaction</h2>
            <p className={styles.stepDesc}>
              Add your first income or expense to get your dashboard started.
              You can skip this and add transactions later too.
            </p>
            <div className={styles.txForm}>

              <div className={styles.typeToggle}>
                {['income', 'expense'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.typeBtn} ${txForm.type === t ? styles.typeBtnActive : ''}`}
                    onClick={() => setTxForm(prev => ({ ...prev, type: t }))}
                  >
                    {t === 'income' ? '📈 Income' : '📉 Expense'}
                  </button>
                ))}
              </div>

              <div className={styles.field}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. June stipend"
                  value={txForm.description}
                  onChange={e => setTxForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={txForm.amount}
                  onChange={e => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                  min="1"
                />
              </div>

              <div className={styles.field}>
                <label>Category</label>
                <select
                  value={txForm.category}
                  onChange={e => setTxForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {['Food','Transport','Shopping','Bills','Salary','Freelance','Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Date</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={e => setTxForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.btnRow}>
              <button className={styles.skipBtn} onClick={() => setStep(3)}>Skip for now</button>
              <button className={styles.primaryBtn} onClick={handleTxNext}>
                Add & continue →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Dashboard tour ══ */}
        {step === 3 && (
          <div className={styles.stepWrap}>
            <div className={styles.tourProgress}>
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.tourDot} ${tourStep >= i ? styles.tourDotActive : ''}`}
                />
              ))}
            </div>

            <div className={styles.tourCard}>
              <h2 className={styles.tourTitle}>{TOUR_STEPS[tourStep].title}</h2>
              <p className={styles.tourDesc}>{TOUR_STEPS[tourStep].desc}</p>
              <div className={styles.tourHighlight}>
                💡 Look for: <strong>{TOUR_STEPS[tourStep].highlight}</strong>
              </div>
            </div>

            <div className={styles.btnRow}>
              {tourStep > 0 && (
                <button className={styles.skipBtn} onClick={() => setTourStep(t => t - 1)}>
                  ← Back
                </button>
              )}
              <button className={styles.primaryBtn} onClick={handleTourNext}>
                {tourStep < TOUR_STEPS.length - 1 ? 'Next →' : '🎉 Go to Dashboard'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}