import { TNotification } from "./notifications.interface";
import Notification from "./notifications.model";

/**
 * ---------- create notification --------------
 *
 * @param payload payload contain notification meta data
 * @returns newly created notification data
 */
const createNotification = async (payload: Omit<TNotification, "isRead">) => {
  const result = Notification.create({
    recipient: payload.recipient,
    sender: payload.sender,
    type: payload.type,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    isRead: false,
  });
  return result;
};

/**
 * ----------- get my all notifications ------------
 *
 * @param userId user who wants his all read/undread all notifications
 * @param page by default 1
 * @param limit by default 10
 * @returns result
 */
const getMyNotifications = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({
    recipient: userId,
  })
    .populate("sender", "name profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    meta: {
      page,
      limit,
      total: limit,
    },
    data: notifications,
  };
};

/**
 * ------------ mark notification as read -------------
 *
 * @param notificationId notification id to mark as read
 * @param userId who want to mark notification as read
 * @returns read data
 */
const markAsRead = async (notificationId: string, userId: string) => {
  const result = Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
      isRead: false,
    },
    { isRead: true },
    { new: true },
  );

  return result;
};

/**
 * ------------- mark all notification as read ---------------
 *
 * @param userId who want to mark all notification as read
 * @returns nothing
 */
const markAllAsRead = async (userId: string) => {
  return Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    { isRead: true },
  );
};

/**
 * -------------- get unread count -----------------
 *
 * @param userId who want to get unread notification counts
 * @returns unread count
 */
const getUnreadCount = async (userId: string) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return { unreadCount: count };
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
