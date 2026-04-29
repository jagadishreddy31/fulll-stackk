const User = require('../models/User');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../services/notificationService');

const generateToken = (id, role) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id, role }, jwtSecret, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role: 'citizen',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password: Send OTP ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    res.json({ message: 'OTP sent to your registered email address.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Verify OTP ────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: 'No OTP request found. Please try again.' });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP. Please check and try again.' });
    }

    // OTP valid — issue a short-lived reset token
    const resetToken = generateToken(user._id, user.role);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified.', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reset Password ────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });

    const workersWithTasks = await Promise.all(workers.map(async (worker) => {
      const activeTaskCount = await Complaint.countDocuments({
        workerId: worker._id,
        status: { $in: ['Registered', 'In Progress', 'Escalated'] }
      });
      return { ...worker.toObject(), activeTaskCount };
    }));

    res.json(workersWithTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, departmentId } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    if (departmentId) user.departmentId = departmentId;
    await user.save();
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Officer Performance Metrics ───────────────────────────────────────────
exports.getOfficerMetrics = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password');

    const metrics = await Promise.all(officers.map(async (officer) => {
      // Get complaints in this officer's department
      const deptComplaints = await Complaint.find({ departmentId: officer.departmentId });

      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => c.status === 'Resolved');
      const escalated = deptComplaints.filter(c => c.isEscalated).length;

      // Avg resolution time in days
      let avgResolutionDays = 0;
      if (resolved.length > 0) {
        const totalMs = resolved.reduce((sum, c) => {
          return sum + (new Date(c.updatedAt) - new Date(c.createdAt));
        }, 0);
        avgResolutionDays = Math.round(totalMs / resolved.length / (1000 * 60 * 60 * 24) * 10) / 10;
      }

      // Avg citizen rating
      const rated = resolved.filter(c => c.feedback && c.feedback.rating);
      const avgRating = rated.length > 0
        ? Math.round(rated.reduce((s, c) => s + c.feedback.rating, 0) / rated.length * 10) / 10
        : null;

      return {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        department: officer.departmentId,
        totalComplaints: total,
        resolvedCount: resolved.length,
        escalatedCount: escalated,
        avgResolutionDays,
        avgRating,
        performanceScore: total > 0
          ? Math.round((resolved.length / total) * 100)
          : 0,
      };
    }));

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
