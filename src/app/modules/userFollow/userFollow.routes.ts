import express from "express";
import { UserFollowController } from "./userFollow.controller";
import auth from "../../middlewares/auth";
import optionalAuth from "../../middlewares/optionalAuth";
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
  "/:targetUserId/mutual",
  optionalAuth(),
  UserFollowController.getMutualFriends,
);

// get profile suggestion
router.get(
  "/profile/suggestions",
  optionalAuth(),
  UserFollowController.getFollowSuggestionsWithFallback,
);

export const UserFollowRoutes = router;
