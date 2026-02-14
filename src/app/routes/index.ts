import express, { Request, Response } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { CommentRoutes } from "../modules/comments/comment.routes";
import { PostRoutes } from "../modules/post/post.routes";
import { CloudinaryUploadFileRoutes } from "../modules/uploadFile/uploadFile.routes";
import { PaymentRoutes } from "../modules/payments/payment.routes";
import { InsightsRoutes } from "../modules/insights/insights.routes";
import { PostVoteRoutes } from "../modules/postVote/postVote.routes";
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
router.use("/uploads", CloudinaryUploadFileRoutes);

// payments
router.use("/payments", PaymentRoutes);

// insights
router.use("/insights", InsightsRoutes);

// post vote
router.use("/vote", PostVoteRoutes);

export const ApiRoutes = router;
