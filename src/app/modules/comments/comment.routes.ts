import express from "express";
import validateRequestData from "../../middlewares/validateRequest";
import { CommentControllers } from "./comment.controller";
import auth from "../../middlewares/auth";
import { CommentValidations } from "./comment.validation";
const router = express.Router();

// create a Comment
router.post(
  "/create-comment",
  auth("user"),
  validateRequestData(CommentValidations.createACommentSchema),
  CommentControllers.createAComment
);

// get all comments
router.get("/", CommentControllers.getAllComments);

// get all comments counts for all posts
router.post("/counts", CommentControllers.getAllCommentsForPosts);

// get all comments of a post
router.get("/:postId", CommentControllers.getAllCommentsOfPost);

// delete a comment
router.delete("/:id", auth("user"), CommentControllers.deleteAComment);

// update a comment
router.patch(
  "/:id",
  // auth("user"),
  validateRequestData(CommentValidations.updateACommentSchema),
  CommentControllers.updateAComment
);

export const CommentRoutes = router;
