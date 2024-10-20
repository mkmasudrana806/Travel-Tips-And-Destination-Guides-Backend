import express, { Request, Response } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { CommentRoutes } from "../modules/comments/comment.routes";
import { PostRoutes } from "../modules/post/post.routes";
import { UploadFileRoutes } from "../modules/uploadFile/uploadFile.routes";
import { PaymentRoutes } from "../modules/payments/payment.routes";
 const router = express.Router();

// user
router.use("/users", UserRoutes);

// auth
router.use("/auth", AuthRoutes);

// posts
router.use("/posts", PostRoutes);

// comments
router.use("/comments", CommentRoutes);

// upload image
router.use("/uploads", UploadFileRoutes);

// payments
router.use("/payments",  PaymentRoutes);

export const ApiRoutes = router;
