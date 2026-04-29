const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  issueType: { type: String, required: true }, // e.g., Road, Water, Sanitation
  imageUrls: [{ type: String }], // Array of paths to uploaded images
  status: { type: String, enum: ['Registered', 'In Progress', 'Resolved', 'Escalated', 'Cancelled'], default: 'Registered' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slaDeadline: { type: Date, required: true },
  isEscalated: { type: Boolean, default: false },
  resolvedImageUrl: { type: String },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEmergency: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
