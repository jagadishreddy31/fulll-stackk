const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'worker', 'officer', 'admin'], default: 'citizen' },
  civicPoints: { type: Number, default: 0 },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
