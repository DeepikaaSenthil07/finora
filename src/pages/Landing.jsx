import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './Landing.module.css'

function Landing() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={`${styles.badge} fade-up`}>
            ✦ Personal Finance, Simplified
          </div>
          <h1 className={`${styles.heroTitle} fade-up fade-up-delay-1`}>
            Take control of your <span className="gradient-text">money</span>
          </h1>
          <p className={`${styles.heroSub} fade-up fade-up-delay-2`}>
            Finora helps you track spending, set budgets, and understand
            your finances beautifully and effortlessly.
          </p>
          <div className={`${styles.heroBtns} fade-up fade-up-delay-3`}>
            <Link to="/signup" className="btn-primary">Start for free</Link>
            <Link to="/login"  className="btn-secondary">Log in</Link>
          </div>
        </div>

        {/* ── Floating dashboard preview card ── */}
        <div className={`${styles.heroCard} glass-card fade-up fade-up-delay-2`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Balance</span>
            <span className={styles.cardBadge}>+12.4%</span>
          </div>
          <div className={styles.cardAmount}>₹ 84,320.00</div>
          <div className={styles.cardBars}>
            <div className={styles.barItem}>
              <span>Food</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{width:'65%', background:'var(--primary)'}}></div>
              </div>
              <span>65%</span>
            </div>
            <div className={styles.barItem}>
              <span>Transport</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{width:'40%', background:'var(--accent)'}}></div>
              </div>
              <span>40%</span>
            </div>
            <div className={styles.barItem}>
              <span>Shopping</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{width:'80%', background:'#FF6B6B'}}></div>
              </div>
              <span>80%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={`section ${styles.features}`}>
        <h2 className={styles.sectionTitle}>
          Everything you need to <span className="gradient-text">manage money</span>
        </h2>
        <p className={styles.sectionSub}>
          Built for people who want clarity over their finances without the complexity.
        </p>
        <div className={styles.featureGrid}>
          {[
            { icon: '📊', title: 'Smart Dashboard', desc: 'See your total balance, recent transactions, and spending trends at a glance.' },
            { icon: '💸', title: 'Expense Tracking', desc: 'Log every transaction instantly. Categorized, searchable, and always up to date.' },
            { icon: '🎯', title: 'Budget Goals', desc: 'Set monthly budgets per category and get alerts before you overspend.' },
            { icon: '📈', title: 'Trend Reports', desc: 'Visual charts showing where your money goes month over month.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication keeps your financial data safe and private.' },
            { icon: '📱', title: 'Fully Responsive', desc: 'Works beautifully on your phone, tablet, and desktop.' },
          ].map((f, i) => (
            <div key={i} className={`${styles.featureCard} glass-card`}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <h2>Ready to take control?</h2>
          <p>Join thousands managing their finances smarter with Finora.</p>
          <Link to="/signup" className="btn-primary">Create free account</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© 2026 Finora. Built with React + Node.js</span>
      </footer>
    </div>
  )
}

export default Landing