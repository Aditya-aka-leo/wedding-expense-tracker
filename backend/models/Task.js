const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  actualCost: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);
