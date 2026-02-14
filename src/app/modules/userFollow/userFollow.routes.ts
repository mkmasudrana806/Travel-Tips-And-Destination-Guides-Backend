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

// get followers lists of an user
router.get("/:userId/followers", UserFollowController.getFollowers);

export const UserFollowRoutes = router;
