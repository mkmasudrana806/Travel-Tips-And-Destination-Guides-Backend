import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { PostVoteServices } from "./postVote.service";

// ------------------- upvote/downvote a post -------------------
const votePost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const type = req.body.type;
  const result = await PostVoteServices.toggleVote(userId, postId, type);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "vote successfull",
    data: result,
  });
});

// ------------------- voter list of a post -------------------
const postVoterLists = asyncHanlder(async (req, res) => {
  const postId = req.params.postId;
  const query = req.query;
  const result = await PostVoteServices.postVoterLists(postId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total votes of post retrived successfull",
    data: result,
  });
});

export const PostVoteController = {
  votePost,
  postVoterLists,
};
