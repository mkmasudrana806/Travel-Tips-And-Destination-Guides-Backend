import express from "express";
import { UserFollowController } from "./userFollow.controller";
import auth from "../../middlewares/auth";
import optionalAuth from "../../middlewares/optionalAuth";
const router = express.Router({ mergeParams: true });

// follow/unfollow toggle
router.post("/follow", auth("user"), UserFollowController.toggleFollow);

// get followers lists of an user
router.get("/followers", UserFollowController.getFollowers);

// get followings lists of an user
router.get("/followings", UserFollowController.getFollowings);

// get mutual friends between two user
router.get("/mutual", optionalAuth(), UserFollowController.getMutualFriends);



export const UserFollowRoutes = router;
