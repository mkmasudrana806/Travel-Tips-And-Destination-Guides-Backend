import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import asyncHanlder from "../../utils/asyncHandler";
import { NotificationService } from "./notifications.service";

// --------------- get my all notifications ----------------
const getMyNotifications = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const query = req.query;
  const { result, meta } = await NotificationService.getMyNotifications(
    userId,
    query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications retrived successfully",
    data: result,
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

export const NotificationsController = {
  getMyNotifications,
  markAsRead,
};
