import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Fin<span>ora</span>
        </Link>
        <div className={styles.links}>
          <Link to="/login"  className={styles.linkItem}>Log in</Link>
          <Link to="/signup" className={`btn-primary ${styles.ctaBtn}`}>Get Started</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar