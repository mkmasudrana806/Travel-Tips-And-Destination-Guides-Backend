import express from "express";
import auth from "../../middlewares/auth";
import { NotificationsController } from "./notifications.controller";
const router = express.Router();

// get my notifications
router.get("/me", auth("user"), NotificationsController.getMyNotifications);

// mark notification as read
router.patch(
  "/:notificationId/read",
  auth("user"),
  NotificationsController.markAsRead,
);

// mark all notification as read
router.patch("/read-all", auth("user"), NotificationsController.markAllAsRead);

export const NotificationsRoutes = router;
