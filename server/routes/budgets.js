import express from 'express'
import Budget from '../models/Budget.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

// GET all budgets for logged-in user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId })
    res.json(budgets)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// POST — create or update a budget
router.post('/', async (req, res) => {
  try {
    const { category, limit } = req.body
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category },
      { limit },
      { upsert: true, new: true }
    )
    res.status(201).json(budget)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// POST many — save multiple budgets at once (used in onboarding)
router.post('/bulk', async (req, res) => {
  try {
    const { budgets } = req.body
    const saved = await Promise.all(
      budgets.map(b =>
        Budget.findOneAndUpdate(
          { user: req.userId, category: b.category },
          { limit: b.limit },
          { upsert: true, new: true }
        )
      )
    )
    res.status(201).json(saved)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// DELETE a budget
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId })
    res.json({ message: 'Budget deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

export default router