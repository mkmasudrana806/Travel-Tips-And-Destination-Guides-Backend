import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { CommentRoutes } from "../modules/comments/comment.routes";
import { PostRoutes } from "../modules/post/post.routes";
import { PaymentRoutes } from "../modules/payments/payment.routes";
import { InsightsRoutes } from "../modules/insights/insights.routes";
import { PostVoteRoutes } from "../modules/postVote/postVote.routes";
import { UserFollowRoutes } from "../modules/userFollow/userFollow.routes";
import { SavedPostRoutes } from "../modules/savedPost/savedPost.route";
import { TravelPlanRoutes } from "../modules/travelPlan/travelPlan.route";
import { TravelRequestRoutes } from "../modules/travelRequest/travelRequest.route";
import { NotificationsRoutes } from "../modules/notifications/notifications.route";
import { MediaUploadRoutes } from "../modules/media/uploadFile.routes";
const router = express.Router();

// user
router.use("/users", UserRoutes);

// auth
router.use("/auth", AuthRoutes);

// posts
router.use("/posts", PostRoutes);

// comments
router.use("/comments", CommentRoutes);

// upload image to cloudinary
router.use("/media", MediaUploadRoutes);

// payments
router.use("/subscriptions", PaymentRoutes);

// insights
router.use("/insights", InsightsRoutes);

// post vote
router.use("/", PostVoteRoutes);

// user follow/unfowllow
router.use("/users", UserFollowRoutes);

// saved travel post
router.use("/saved-post", SavedPostRoutes);

// travel plans
router.use("/travel-plans", TravelPlanRoutes);

// plan request
router.use("/travel-requests", TravelRequestRoutes);

// notifications
router.use("/notifications", NotificationsRoutes);

export const ApiRoutes = router;
