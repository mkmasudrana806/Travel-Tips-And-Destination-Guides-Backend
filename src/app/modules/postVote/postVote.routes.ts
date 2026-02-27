import express from "express";
import { PostVoteController } from "./postVote.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PostVoteValidations } from "./postVote.validation";
const router = express.Router({ mergeParams: true });
const voteRouter = express.Router();

// upvote/downvote to a post
router.post(
  "/",
  auth("user"),
  validateRequestData(PostVoteValidations.postVoteValidation),
  PostVoteController.votePost,
);

// votes (voters list of a post) (type=upvote/downvote)
router.get("/", PostVoteController.postVoterLists);

// list of posts i votes
voteRouter.get("/me", auth("user"), PostVoteController.listsOfPostsIVote);

// for children routes of post
export const PostVoteRoutes = router;

// standalone '/votes' route
export const VoteRoutes = voteRouter;
