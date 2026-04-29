const mongoose = require('mongoose');

const slaConfigSchema = new mongoose.Schema({
  highPriorityHours: { type: Number, default: 24 },
  mediumPriorityHours: { type: Number, default: 72 },
  lowPriorityHours: { type: Number, default: 120 }
}, { timestamps: true });

module.exports = mongoose.model('SLAConfig', slaConfigSchema);
