const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, unique: true },
  issueTypes: [{ type: String }] // List of issue types handled by this department
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
