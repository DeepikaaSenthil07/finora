import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Sidebar                 from '../components/Sidebar'
import { useAuth }             from '../context/AuthContext'
import api                     from '../api/axios'
import styles                  from './Profile.module.css'

function SuccessBanner({ message }) {
  if (!message) return null
  return <div className={styles.success}>{message}</div>
}

function ErrorBanner({ message }) {
  if (!message) return null
  return <div className={styles.error}>{message}</div>
}

function Profile() {
  const { user, login, logout } = useAuth()
  const navigate                = useNavigate()

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [profileMsg,  setProfileMsg]  = useState({ success: '', error: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  // Password form
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [pwMsg,  setPwMsg]  = useState({ success: '', error: '' })
  const [pwSaving, setPwSaving] = useState(false)

  // Delete
  const [showDelete,  setShowDelete]  = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteMsg,   setDeleteMsg]   = useState('')

  // Load current profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/profile')
        setProfileForm({ name: res.data.name, email: res.data.email })
      } catch (err) {
        console.error('Failed to load profile')
      }
    }
    fetchProfile()
  }, [])

  // ── Update profile ──
  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileMsg({ success: '', error: '' })
    setProfileSaving(true)

    try {
      const res = await api.patch('/profile', profileForm)
      // Update user in AuthContext so sidebar name updates immediately
      login(res.data, localStorage.getItem('finora_token'))
      setProfileMsg({ success: 'Profile updated successfully!', error: '' })
    } catch (err) {
      setProfileMsg({ success: '', error: err.response?.data?.message || 'Update failed.' })
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Change password ──
  async function handlePasswordSave(e) {
    e.preventDefault()
    setPwMsg({ success: '', error: '' })

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ success: '', error: 'New passwords do not match.' })
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ success: '', error: 'New password must be at least 6 characters.' })
      return
    }

    setPwSaving(true)
    try {
      await api.patch('/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword
      })
      setPwMsg({ success: 'Password changed successfully!', error: '' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ success: '', error: err.response?.data?.message || 'Password change failed.' })
    } finally {
      setPwSaving(false)
    }
  }

  // ── Delete account ──
  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') {
      setDeleteMsg('Please type DELETE exactly to confirm.')
      return
    }
    try {
      await api.delete('/profile')
      logout()
      navigate('/')
    } catch (err) {
      setDeleteMsg('Failed to delete account. Please try again.')
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Manage your account details</p>
        </div>

        {/* ── Avatar + name ── */}
        <div className={`${styles.avatarCard} glass-card`}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className={styles.avatarName}>{user?.name}</h2>
            <p className={styles.avatarEmail}>{profileForm.email}</p>
          </div>
        </div>

        {/* ── Update profile ── */}
        <div className={`${styles.section} glass-card`}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <p className={styles.sectionDesc}>Update your name and email address.</p>

          <SuccessBanner message={profileMsg.success} />
          <ErrorBanner   message={profileMsg.error}   />

          <form className={styles.form} onSubmit={handleProfileSave}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" className={styles.saveBtn} disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className={`${styles.section} glass-card`}>
          <h3 className={styles.sectionTitle}>Change Password</h3>
          <p className={styles.sectionDesc}>Choose a strong password with at least 6 characters.</p>

          <SuccessBanner message={pwMsg.success} />
          <ErrorBanner   message={pwMsg.error}   />

          <form className={styles.form} onSubmit={handlePasswordSave}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 6 characters"
              />
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
              />
            </div>
            <button type="submit" className={styles.saveBtn} disabled={pwSaving}>
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        {/* ── Danger zone ── */}
        <div className={`${styles.section} ${styles.dangerSection}`}>
          <h3 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h3>
          <p className={styles.sectionDesc}>
            Permanently delete your account and all your data including transactions
            and budgets. This action cannot be undone.
          </p>

          {!showDelete ? (
            <button
              className={styles.deleteBtn}
              onClick={() => setShowDelete(true)}
            >
              Delete my account
            </button>
          ) : (
            <div className={styles.deleteConfirm}>
              <p className={styles.deleteWarning}>
                ⚠ Type <strong>DELETE</strong> below to permanently delete your account:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="Type DELETE here"
                className={styles.deleteInput}
              />
              {deleteMsg && <p className={styles.deleteMsg}>{deleteMsg}</p>}
              <div className={styles.deleteBtns}>
                <button
                  className={styles.cancelDeleteBtn}
                  onClick={() => { setShowDelete(false); setDeleteInput(''); setDeleteMsg('') }}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteBtn}
                  onClick={handleDeleteAccount}
                >
                  Permanently delete
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default Profile