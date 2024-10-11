import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { CommentRoutes } from "../modules/comments/comment.routes";
const router = express.Router();

// user
router.use("/users", UserRoutes);

// auth
router.use("/auth", AuthRoutes);

// comments
router.use("/comments", CommentRoutes);

export const ApiRoutes = router;
