const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, broadcastToWorkers } = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.post('/broadcast', protect, authorize('admin', 'officer'), broadcastToWorkers);

module.exports = router;
