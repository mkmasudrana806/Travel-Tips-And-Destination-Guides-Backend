import express from "express";
import { PostVoteController } from "./postVote.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PostVoteValidations } from "./postVote.validation";
const router = express.Router();

// upvote/downvote to a post
router.post(
  "/posts/:postId/votes",
  auth("user"),
  validateRequestData(PostVoteValidations.postVoteValidation),
  PostVoteController.votePost,
);

// votes (voters list of a post) (type=upvote/downvote)
router.get("/posts/:postId/votes", PostVoteController.postVoterLists);

// list of posts i votes
router.get(
  "/users/me/votes",
  auth("user"),
  PostVoteController.listsOfPostsIVote,
);

export const PostVoteRoutes = router;
