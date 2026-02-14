import express from "express";
import { PostVoteController } from "./postVote.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PostVoteValidations } from "./postVote.validation";
const router = express.Router();

// upvote/downvote to a post
router.post(
  "/posts/:postId/vote",
  auth("user"),
  validateRequestData(PostVoteValidations.postVoteValidation),
  PostVoteController.votePost,
);

// votes (voters list of a post)
router.get(
  "/posts/:postId/votes",
  auth("user"),
  PostVoteController.postVoterLists,
);

export const PostVoteRoutes = router;
