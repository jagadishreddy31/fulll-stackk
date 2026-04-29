const express = require('express');
const router = express.Router();
const {
  register, login, getMe, getAllUsers, updateUserRole, getWorkers,
  forgotPassword, verifyOtp, resetPassword, getOfficerMetrics
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/workers', protect, authorize('admin', 'officer'), getWorkers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/officer-metrics', protect, authorize('admin'), getOfficerMetrics);

// Forgot Password Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', protect, resetPassword);

module.exports = router;
