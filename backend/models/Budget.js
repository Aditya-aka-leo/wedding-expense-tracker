const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  totalBudget: { type: Number, required: true },
  amountSpent: { type: Number, default: 0 },
  remaining: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Budget', budgetSchema);
