const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  citizenName: { type: String, default: 'Anonymous Citizen' },
  cnic: { type: String, default: 'Unregistered' },
  phone: { type: String, default: 'N/A' },
  province: { type: String, default: 'Sindh' },
  city: { type: String, default: 'Karachi' },
  addressLine1: { type: String, default: 'Main Area' },
  addressLine2: { type: String, default: '' },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignedDepartment: { type: String, default: '' },
  resolutionNotes: { type: String, default: '' },
  isDuplicate: { type: Boolean, default: false },
  duplicateGroupId: { type: String, default: '' },
  aiOutput: {
    category: String,
    priority: String,
    confidence: Number,
    visualSummary: String
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
