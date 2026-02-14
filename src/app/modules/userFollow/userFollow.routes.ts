import express from "express";
import { UserFollowController } from "./userFollow.controller";
import auth from "../../middlewares/auth";
const router = express.Router();

// follow/unfollow toggle
router.post(
  "/:targetUserId/follow",
  auth("user"),
  UserFollowController.toggleFollow,
);
export const UserFollowRoutes = router;
