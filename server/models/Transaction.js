import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  category:    { type: String, required: true },
  date:        { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('Transaction', transactionSchema)