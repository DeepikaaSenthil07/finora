import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Sidebar.module.css'

const navItems = [
  { path: '/dashboard',    icon: '📊', label: 'Dashboard'    },
  { path: '/transactions', icon: '💸', label: 'Transactions' },
  { path: '/budget',       icon: '🎯', label: 'Budget'       },
  { path: '/profile',      icon: '👤', label: 'Profile'      },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Fin<span>ora</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userText}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userEmail}>{user?.email || ''}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar