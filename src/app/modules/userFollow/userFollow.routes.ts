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

// get followings lists of an user
router.get("/:userId/followings", UserFollowController.getFollowings);

// get mutual friends between two user
router.get(
  "/:targetUserId/mutual-friends",
  auth("user"),
  UserFollowController.getMutualFriends,
);

export const UserFollowRoutes = router;
