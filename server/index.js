import express    from 'express'
import cors       from 'cors'
import dotenv     from 'dotenv'
import connectDB  from './config/db.js'
import authRoutes from './routes/auth.js'
import txRoutes   from './routes/transactions.js'
import budgetRoutes from './routes/budgets.js'  // ADD THIS
import profileRoutes from './routes/profile.js'
dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth',         authRoutes)
app.use('/api/transactions', txRoutes)
app.use('/api/budgets',      budgetRoutes)  // ADD THIS
app.use('/api/profile', profileRoutes)
app.get('/', (req, res) => {
  res.json({ message: 'Finora API is running' })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})