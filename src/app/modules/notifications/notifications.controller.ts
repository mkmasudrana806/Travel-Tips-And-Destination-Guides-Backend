import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import asyncHanlder from "../../utils/asyncHandler";
import { NotificationService } from "./notifications.service";

// --------------- get my all notifications ----------------
const getMyNotifications = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const query = req.query;
  const { data, meta } = await NotificationService.getMyNotifications(
    userId,
    query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications retrived successfully",
    data: data,
    meta: meta,
  });
});

// --------------- mark notification as read ----------------
const markAsRead = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const notificationId = req.params.notificationId;
  const result = await NotificationService.markAsRead(notificationId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read successfull",
    data: result,
  });
});

// --------------- mark notification as read ----------------
const markAllAsRead = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const result = await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notification marked as read successfull",
    data: result,
  });
});

// --------------- mark notification as read ----------------
const getUnreadCount = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const result = await NotificationService.getUnreadCount(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Calculated un read notification counts",
    data: result,
  });
});

export const NotificationsController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
