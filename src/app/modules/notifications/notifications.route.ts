import express from "express";
import auth from "../../middlewares/auth";
import { NotificationsController } from "./notifications.controller";
const router = express.Router();

// get my notifications
router.get("/me", auth("user"), NotificationsController.getMyNotifications);

export const NotificationsRoutes = router;