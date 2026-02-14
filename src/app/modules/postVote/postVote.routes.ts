import express from "express";
import { PostVoteController } from "./postVote.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PostVoteValidations } from "./postVote.validation";
const router = express.Router();

// upvote/downvote to a post
router.post(
  "/post/:postId",
  auth("user"),
  validateRequestData(PostVoteValidations.postVoteValidation),
  PostVoteController.votePost,
);

export const PostVoteRoutes = router;
