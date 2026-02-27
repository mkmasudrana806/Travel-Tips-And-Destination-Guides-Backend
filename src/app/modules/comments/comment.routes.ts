import express from "express";
import validateRequestData from "../../middlewares/validateRequest";
import { CommentControllers } from "./comment.controller";
import auth from "../../middlewares/auth";
import { CommentValidations } from "./comment.validation";
import optionalAuth from "../../middlewares/optionalAuth";

// '/comments'
const router = express.Router();

// '/posts/:postId/comments'
const postRouter = express.Router({ mergeParams: true });

// create a Comment
postRouter.post(
  "/",
  auth("user"),
  validateRequestData(CommentValidations.createACommentSchema),
  CommentControllers.createAComment,
);

// get all root comments with depth 1's replies (latest 3 replies for depth 1)
postRouter.get("/", optionalAuth(), CommentControllers.getAllComments);

// get replies of a comment
router.get("/:commentId/replies", CommentControllers.getRepliesOfComment);

// delete a comment
router.delete("/:commentId", auth("user"), CommentControllers.deleteAComment);

// update a comment
router.patch(
  "/:commentId",
  auth("user"),
  validateRequestData(CommentValidations.updateACommentSchema),
  CommentControllers.updateAComment,
);

// for posts router as childrent route
export const PostCommentsRoutes = postRouter;

// for root '/comments' middleware
export const CommentRoutes = router;
