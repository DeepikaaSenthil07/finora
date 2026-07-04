import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import Onboarding from '../components/Onboarding'
import { useFinance } from '../context/FinanceContext'
import Sidebar from '../components/Sidebar'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import styles from './Dashboard.module.css'

const COLORS = ['#6C63FF', '#00C896', '#FF6B6B', '#FFB347', '#4EC9FF']

function StatCard({ label, amount, color, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: `${color}18` }}>
        <span>{icon}</span>
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statAmount} style={{ color }}>
          ₹ {amount.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  // ✅ ALL hooks must be inside the function — never outside
  const { transactions, loading, totalIncome, totalExpense, balance, chartData } = useFinance()

  // ✅ useMemo also inside the function
  const monthlyData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const data = months.map(month => ({ month, income: 0, expense: 0 }))

    transactions.forEach(tx => {
      const monthIndex = new Date(tx.date).getMonth()
      if (tx.type === 'income')  data[monthIndex].income  += tx.amount
      if (tx.type === 'expense') data[monthIndex].expense += tx.amount
    })

    const currentMonth = new Date().getMonth()
    return data.filter((_, i) => i <= currentMonth)
  }, [transactions])

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner}></div>
        <p>Loading your finances…</p>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      {user?.isNew && <Onboarding />}
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Here's your financial overview</p>
          </div>
          <div className={styles.dateBadge}>June 2026</div>
        </div>

        {/* ── Stat cards ── */}
        <div className={styles.statsRow}>
          <StatCard label="Total Balance"  amount={balance}      color="var(--primary)" icon="💰" />
          <StatCard label="Total Income"   amount={totalIncome}  color="var(--accent)"  icon="📈" />
          <StatCard label="Total Expenses" amount={totalExpense} color="#FF6B6B"        icon="📉" />
        </div>

        {/* ── Charts row ── */}
        <div className={styles.chartsRow}>

          {/* Bar chart — real monthly data */}
          <div className={`${styles.chartCard} glass-card`}>
            <h3 className={styles.chartTitle}>Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  formatter={(value) => [`₹ ${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="income"  fill="var(--accent)"  radius={[4,4,0,0]} name="Income" />
                <Bar dataKey="expense" fill="var(--primary)" radius={[4,4,0,0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — real category data */}
          <div className={`${styles.chartCard} glass-card`}>
            <h3 className={styles.chartTitle}>Spending by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹ ${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {chartData.map((item, i) => (
                <div key={i} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }}></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className={`${styles.recentCard} glass-card`}>
          <h3 className={styles.chartTitle}>Recent Transactions</h3>
          <div className={styles.txList}>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                No transactions yet — add one from the Transactions page!
              </p>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <div key={tx._id} className={styles.txItem}>
                  <div className={styles.txLeft}>
                    <div className={styles.txIcon}>
                      {tx.type === 'income' ? '📈' : '📉'}
                    </div>
                    <div>
                      <p className={styles.txDesc}>{tx.description}</p>
                      <p className={styles.txMeta}>{tx.category} · {tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={styles.txAmount}
                    style={{ color: tx.type === 'income' ? 'var(--accent)' : '#FF6B6B' }}
                  >
                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard
