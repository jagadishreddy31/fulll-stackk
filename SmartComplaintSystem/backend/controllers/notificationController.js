const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.broadcastToWorkers = async (req, res) => {
  try {
    const { message } = req.body;
    const workers = await User.find({ role: 'worker' });
    
    const notifications = workers.map(worker => ({
      userId: worker._id,
      message: `[BROADCAST] ${message}`
    }));
    
    await Notification.insertMany(notifications);
    res.json({ message: `Broadcast sent to ${workers.length} workers` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
