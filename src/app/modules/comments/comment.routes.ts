import express from "express";
import validateRequestData from "../../middlewares/validateRequest";
import { CommentControllers } from "./comment.controller";
import auth from "../../middlewares/auth";
import { CommentValidations } from "./comment.validation";
const router = express.Router();

// create a Comment
router.post(
  "/",
  auth("user"),
  validateRequestData(CommentValidations.createACommentSchema),
  CommentControllers.createAComment,
);

// get all comments (paginated) only root comments with depth 1 replies (latest 3 replies)
router.get(
  "/",
  validateRequestData(CommentValidations.getCommentsOfPost),
  CommentControllers.getAllComments,
);

// get replies of a comment
router.get("/:commentId/replies", CommentControllers.getRepliesOfComment);

// delete a comment
router.delete("/:id", auth("user"), CommentControllers.deleteAComment);

// update a comment
router.patch(
  "/:id",
  // auth("user"),
  validateRequestData(CommentValidations.updateACommentSchema),
  CommentControllers.updateAComment,
);

export const CommentRoutes = router;
