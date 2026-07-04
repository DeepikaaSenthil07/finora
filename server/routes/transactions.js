import express     from 'express'
import Transaction from '../models/Transaction.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1, createdAt: -1 })
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { type, description, amount, category, date } = req.body
    const transaction = await Transaction.create({
      user: req.userId,
      type,
      description,
      amount,
      category,
      date
    })
    res.status(201).json(transaction)
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' })
    }

    await transaction.deleteOne()
    res.json({ message: 'Transaction deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
})

export default router