import express from 'express'
import bcrypt  from 'bcryptjs'
import User    from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Budget  from '../models/Budget.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

// GET — fetch current user profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// PATCH — update name or email
router.patch('/', async (req, res) => {
  try {
    const { name, email } = req.body

    // Check if email is taken by another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } })
      if (existing) {
        return res.status(400).json({ message: 'This email is already in use.' })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-password')

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// PATCH — change password
router.patch('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.userId)
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' })
    }

    const salt           = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await User.findByIdAndUpdate(req.userId, { password: hashedPassword })

    res.json({ message: 'Password updated successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// DELETE — delete account and all associated data
router.delete('/', async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.userId })
    await Budget.deleteMany({ user: req.userId })
    await User.findByIdAndDelete(req.userId)
    res.json({ message: 'Account deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

export default router