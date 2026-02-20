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
router.get("/my-votes", auth("user"), PostVoteController.listsOfPostsIVote);

// my vote status of a post
router.get(
  "/posts/:postId/my-status",
  auth("user"),
  PostVoteController.myVoteStatus,
);

export const PostVoteRoutes = router;
