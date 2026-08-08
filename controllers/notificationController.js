// const Notification = require('../models/Notification');

// /**
//  * @desc    Get user's notifications
//  * @route   GET /api/notifications
//  * @access  Private
//  */
// exports.getAllNotifications = async (req, res) => {
//   try {
//     const { unreadOnly } = req.query;

//     const query = { userId: req.user.id };
//     if (unreadOnly === 'true') query.read = false;

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(50);

//     const unreadCount = await Notification.countDocuments({
//       userId: req.user.id,
//       read: false
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         unreadCount
//       }
//     });
//   } catch (error) {
//     console.error('Get notifications error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Mark notification as read
//  * @route   PUT /api/notifications/:id/read
//  * @access  Private
//  */
// exports.markAsRead = async (req, res) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         error: 'Notification not found'
//       });
//     }

//     // Check if user owns this notification
//     if (notification.userId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: 'Not authorized to update this notification'
//       });
//     }

//     notification.read = true;
//     await notification.save();

//     res.status(200).json({
//       success: true,
//       message: 'Notification marked as read',
//       data: { notification }
//     });
//   } catch (error) {
//     console.error('Mark notification read error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Mark all notifications as read
//  * @route   PUT /api/notifications/mark-all-read
//  * @access  Private
//  */
// exports.markAllAsRead = async (req, res) => {
//   try {
//     await Notification.updateMany(
//       { userId: req.user.id },
//       { read: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'All notifications marked as read'
//     });
//   } catch (error) {
//     console.error('Mark all read error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Delete notification
//  * @route   DELETE /api/notifications/:id
//  * @access  Private
//  */
// exports.deleteNotification = async (req, res) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         error: 'Notification not found'
//       });
//     }

//     // Check if user owns this notification
//     if (notification.userId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: 'Not authorized to delete this notification'
//       });
//     }

//     await Notification.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Clear all notifications
//  * @route   DELETE /api/notifications/clear-all
//  * @access  Private
//  */
// exports.clearAllNotifications = async (req, res) => {
//   try {
//     await Notification.deleteMany({ userId: req.user.id });

//     res.status(200).json({
//       success: true,
//       message: 'All notifications cleared'
//     });
//   } catch (error) {
//     console.error('Clear notifications error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

const Notification = require('../models/Notification');

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification removed successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications/clear-all
 * @access  Private
 */
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully'
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Global Helper Function to trigger a proper notification
 *          Call this function anywhere inside your other controllers (e.g. orderController or paymentController)
 * @param   {Object} app Express Application Instance reference (req.app)
 * @param   {Object} data Data payload wrapper containing { userId, userEmail, title, message, type }
 */
exports.createAndSendNotification = async (app, data) => {
  try {
    // 1. Save Notification details to MongoDB
    const notification = await Notification.create({
      userId: data.userId,
      userEmail: data.userEmail,
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      read: false
    });

    // 2. Fire the Live Socket transmission stream instance
    const io = app.get('io');
    if (io) {
      // Direct notification sent targeting that specific user's socket room channel
      io.to(`user-${data.userId}`).emit('incoming-notification', {
        success: true,
        notification
      });
      console.log(`Live Notification successfully beamed to channel: user-${data.userId}`);
    }
    return notification;
  } catch (err) {
    console.error('Failed to parse real-time database notification pipeline:', err.message);
    return null;
  }
};
