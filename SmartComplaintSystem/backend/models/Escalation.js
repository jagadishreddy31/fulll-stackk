const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  escalatedTo: { type: String, enum: ['supervisor', 'admin'], default: 'admin' },
  reason: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Escalation', escalationSchema);
