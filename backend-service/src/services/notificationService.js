import Notification from '../models/Notification.js';

/**
 * Creates and dispatches a notification to both MongoDB and targeted Socket.IO rooms.
 */
export const dispatchNotification = async (io, { recipient_id, title, message, type, ticket_id = null, role = null }) => {
  try {
    let savedNotification = null;

    if (recipient_id) {
      savedNotification = await Notification.create({
        recipient_id,
        title,
        message,
        type,
        ticket_id,
      });
    }

    if (io) {
      const payload = {
        _id: savedNotification?._id,
        recipient_id,
        title,
        message,
        type,
        ticket_id,
        createdAt: savedNotification?.createdAt || new Date().toISOString(),
      };

      // Emit to direct user room
      if (recipient_id) {
        io.to(`user:${recipient_id}`).emit('notification:new', payload);
      }

      // If a role is specified, broadcast to role room
      if (role) {
        io.to(`role:${role}`).emit('notification:new', payload);
      }
    }

    return savedNotification;
  } catch (err) {
    console.error('Failed to dispatch notification:', err.message);
    return null;
  }
};
