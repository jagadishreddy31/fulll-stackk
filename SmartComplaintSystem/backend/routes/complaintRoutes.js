const express = require('express');
const router = express.Router();
const {
  createComplaint, getComplaints, updateStatus, getDashboardStats, checkSLA,
  cancelComplaint, addFeedback, addMessage, getPublicComplaints, assignWorker,
  flagEmergency, upvoteComplaint, exportData, getSLAConfig, updateSLAConfig,
  checkDuplicate, getCalendarData
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/export', protect, authorize('admin'), exportData);
router.get('/slaconfig', protect, authorize('admin'), getSLAConfig);
router.put('/slaconfig', protect, authorize('admin'), updateSLAConfig);
router.get('/stats', protect, authorize('admin', 'officer'), getDashboardStats);
router.post('/check-sla', protect, authorize('admin'), checkSLA);
router.get('/check-duplicate', protect, checkDuplicate);
router.get('/calendar', protect, getCalendarData);
router.get('/public', getPublicComplaints);

router.post('/', protect, upload.array('images', 3), createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id/status', protect, authorize('admin', 'officer', 'worker'), upload.single('resolvedImage'), updateStatus);
router.put('/:id/assign', protect, authorize('admin', 'officer'), assignWorker);
router.put('/:id/emergency', protect, authorize('worker'), flagEmergency);
router.put('/:id/upvote', protect, authorize('citizen'), upvoteComplaint);
router.put('/:id/cancel', protect, authorize('citizen'), cancelComplaint);
router.put('/:id/feedback', protect, authorize('citizen'), addFeedback);
router.post('/:id/messages', protect, addMessage);

module.exports = router;
