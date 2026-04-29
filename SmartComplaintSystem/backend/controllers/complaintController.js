const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Escalation = require('../models/Escalation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const SLAConfig = require('../models/SLAConfig');
const { sendStatusEmail, sendRegistrationEmail } = require('../services/notificationService');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, issueType, priority, lat, lng } = req.body;
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      imageUrls.push(`/uploads/${req.file.filename}`);
    }

    // Auto-assign department based on issueType
    let department = await Department.findOne({ issueTypes: issueType });
    if (!department) {
      department = await Department.findOne();
    }
    if (!department) {
      return res.status(400).json({ message: 'No departments available in the system.' });
    }

    let config = await SLAConfig.findOne();
    if (!config) config = await SLAConfig.create({});
    const priorityLevel = priority || 'Medium';
    let hours = config.mediumPriorityHours;
    if (priorityLevel === 'High') hours = config.highPriorityHours;
    else if (priorityLevel === 'Low') hours = config.lowPriorityHours;

    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + hours);

    const complaint = await Complaint.create({
      userId: req.user.id,
      title,
      description,
      issueType,
      priority: priority || 'Medium',
      location: lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined,
      imageUrls,
      departmentId: department._id,
      slaDeadline,
    });

    // Send confirmation email
    const citizen = await User.findById(req.user.id);
    if (citizen) {
      await sendRegistrationEmail(citizen.email, citizen.name, title);
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query.userId = req.user.id;
    } else if (req.user.role === 'worker') {
      query.workerId = req.user.id;
    } else if (req.user.role === 'officer') {
      // Filter by officer's department
      const officer = await User.findById(req.user.id);
      if (officer && officer.departmentId) {
        query.departmentId = officer.departmentId;
      }
    }

    const complaints = await Complaint.find(query)
      .populate('departmentId', 'departmentName')
      .populate('userId', 'name email phone')
      .populate('workerId', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    let resolvedImageUrl = complaint.resolvedImageUrl;
    if (status === 'Resolved' && req.file) {
      resolvedImageUrl = `/uploads/${req.file.filename}`;
    } else if (status === 'Resolved' && req.user.role === 'worker' && !complaint.resolvedImageUrl && !req.file) {
      return res.status(400).json({ message: 'Must provide resolution image proof.' });
    }

    complaint.status = status;
    if (resolvedImageUrl) complaint.resolvedImageUrl = resolvedImageUrl;
    await complaint.save();

    if (status === 'Resolved') {
      await User.findByIdAndUpdate(complaint.userId, { $inc: { civicPoints: 10 } });
    }

    // In-app notification
    await Notification.create({
      userId: complaint.userId,
      message: `The status of your complaint "${complaint.title}" has been updated to ${status}.`
    });

    // Email notification
    const citizen = await User.findById(complaint.userId);
    if (citizen) {
      await sendStatusEmail(citizen.email, citizen.name, complaint.title, status);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.workerId = workerId;
    if (complaint.status === 'Registered') complaint.status = 'In Progress';
    await complaint.save();

    await Notification.create({
      userId: workerId,
      message: `You have been assigned to a new complaint: "${complaint.title}".`
    });

    res.json({ message: 'Worker assigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const escalated = await Complaint.countDocuments({ status: 'Escalated' });
    const inProgress = await Complaint.countDocuments({ status: { $in: ['Registered', 'In Progress'] } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const registeredToday = await Complaint.countDocuments({ createdAt: { $gte: startOfDay } });
    const resolvedToday = await Complaint.countDocuments({ status: 'Resolved', updatedAt: { $gte: startOfDay } });
    const solvingRatio = registeredToday > 0 ? Math.round((resolvedToday / registeredToday) * 100) : 0;

    const categories = await Complaint.aggregate([{ $group: { _id: "$issueType", count: { $sum: 1 } } }]);
    const priorities = await Complaint.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const mappedComplaints = await Complaint.find({ "location.lat": { $exists: true } })
      .select('title issueType status location createdAt priority')
      .sort({ createdAt: -1 })
      .limit(100);

    // Department-wise stats
    const byDepartment = await Complaint.aggregate([
      { $group: { _id: "$departmentId", count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, count: 1, resolved: 1, deptName: '$dept.departmentName' } }
    ]);

    res.json({ total, resolved, escalated, inProgress, registeredToday, resolvedToday, solvingRatio, categories, priorities, mappedComplaints, byDepartment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Duplicate Detection ───────────────────────────────────────────────────
exports.checkDuplicate = async (req, res) => {
  try {
    const { issueType, lat, lng, title } = req.query;
    const userId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Check for same user + same issueType + active status within 7 days
    const existing = await Complaint.find({
      userId,
      issueType,
      status: { $nin: ['Cancelled', 'Resolved'] },
      createdAt: { $gte: sevenDaysAgo }
    }).select('_id title status createdAt');

    // Also check location proximity if provided (within ~500m)
    if (lat && lng && existing.length === 0) {
      const nearby = await Complaint.find({
        issueType,
        status: { $nin: ['Cancelled', 'Resolved'] },
        'location.lat': { $gte: Number(lat) - 0.005, $lte: Number(lat) + 0.005 },
        'location.lng': { $gte: Number(lng) - 0.005, $lte: Number(lng) + 0.005 },
        createdAt: { $gte: sevenDaysAgo }
      }).select('_id title status createdAt');

      if (nearby.length > 0) {
        return res.json({ duplicate: true, complaints: nearby, type: 'nearby' });
      }
    }

    if (existing.length > 0) {
      return res.json({ duplicate: true, complaints: existing, type: 'same_user' });
    }

    res.json({ duplicate: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Calendar View ─────────────────────────────────────────────────────────
exports.getCalendarData = async (req, res) => {
  try {
    const { year, month } = req.query; // month is 1-indexed
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    let query = {};
    if (req.user.role === 'officer') {
      const officer = await User.findById(req.user.id);
      if (officer && officer.departmentId) query.departmentId = officer.departmentId;
    }

    const complaints = await Complaint.find({
      ...query,
      slaDeadline: { $gte: startDate, $lte: endDate }
    }).select('title status priority slaDeadline issueType').sort({ slaDeadline: 1 });

    // Group by day
    const grouped = {};
    complaints.forEach(c => {
      const day = new Date(c.slaDeadline).getDate();
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(c);
    });

    res.json({ year: y, month: m, data: grouped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (complaint.status !== 'Registered') return res.status(400).json({ message: 'Only newly registered complaints can be cancelled' });

    complaint.status = 'Cancelled';
    await complaint.save();
    res.json({ message: 'Complaint cancelled successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkSLA = async (req, res) => {
  try {
    const overdueComplaints = await Complaint.find({
      status: { $ne: 'Resolved' },
      isEscalated: false,
      slaDeadline: { $lt: new Date() }
    });

    for (let complaint of overdueComplaints) {
      complaint.status = 'Escalated';
      complaint.isEscalated = true;
      await complaint.save();

      await Escalation.create({ complaintId: complaint._id, reason: 'SLA breached automatically by system script.' });

      // Notify citizen
      const citizen = await User.findById(complaint.userId);
      if (citizen) {
        await sendStatusEmail(citizen.email, citizen.name, complaint.title, 'Escalated');
      }
    }

    res.json({ message: `Escalated ${overdueComplaints.length} complaints.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (complaint.status !== 'Resolved') return res.status(400).json({ message: 'Can only review resolved complaints' });

    complaint.feedback = { rating, comment };
    await complaint.save();
    res.json({ message: 'Feedback added successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.messages.push({ senderId: req.user.id, senderName: req.user.name, text });
    await complaint.save();

    if (req.user.role !== 'citizen') {
      await Notification.create({
        userId: complaint.userId,
        message: `New message on complaint "${complaint.title}" from ${req.user.name}`
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: 'Cancelled' } })
      .select('title issueType status location createdAt priority imageUrls upvotes')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    complaint.isEmergency = true;
    complaint.priority = 'High';
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.upvotes.includes(req.user.id)) return res.status(400).json({ message: 'Already upvoted' });

    complaint.upvotes.push(req.user.id);
    if (complaint.upvotes.length >= 5 && complaint.priority !== 'High') {
      complaint.priority = 'High';
      let config = await SLAConfig.findOne();
      if (!config) config = await SLAConfig.create({});
      const newDeadline = new Date(complaint.createdAt);
      newDeadline.setHours(newDeadline.getHours() + config.highPriorityHours);
      if (newDeadline > new Date()) complaint.slaDeadline = newDeadline;
    }
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId', 'name').populate('workerId', 'name').sort({ createdAt: -1 });
    const pending = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Cancelled');
    const resolved = complaints.filter(c => c.status === 'Resolved');

    let csv = '=== ACTIVE ISSUES ===\n';
    csv += 'ID No.,Title,Status,Priority,Category,Citizen,Worker,Reported Date,SLA Deadline,Latitude,Longitude\n';
    pending.forEach((c, i) => {
      csv += `"${i + 1}","${c.title}","${c.status}","${c.priority}","${c.issueType}","${c.userId?.name || ''}","${c.workerId?.name || ''}","${new Date(c.createdAt).toLocaleDateString()}","${new Date(c.slaDeadline).toLocaleDateString()}","${c.location?.lat || ''}","${c.location?.lng || ''}"\n`;
    });
    csv += '\n\n=== RESOLVED ISSUES ===\n';
    csv += 'ID No.,Title,Status,Priority,Category,Citizen,Worker,Reported Date,SLA Deadline,Latitude,Longitude\n';
    resolved.forEach((c, i) => {
      csv += `"${i + 1}","${c.title}","${c.status}","${c.priority}","${c.issueType}","${c.userId?.name || ''}","${c.workerId?.name || ''}","${new Date(c.createdAt).toLocaleDateString()}","${new Date(c.slaDeadline).toLocaleDateString()}","${c.location?.lat || ''}","${c.location?.lng || ''}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('complaints_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSLAConfig = async (req, res) => {
  try {
    let config = await SLAConfig.findOne();
    if (!config) config = await SLAConfig.create({});
    res.json(config);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateSLAConfig = async (req, res) => {
  try {
    let config = await SLAConfig.findOne();
    if (!config) config = new SLAConfig();
    config.highPriorityHours = req.body.highPriorityHours || config.highPriorityHours;
    config.mediumPriorityHours = req.body.mediumPriorityHours || config.mediumPriorityHours;
    config.lowPriorityHours = req.body.lowPriorityHours || config.lowPriorityHours;
    await config.save();
    res.json(config);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
