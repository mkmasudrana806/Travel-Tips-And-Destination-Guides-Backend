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
    message: result ? "upvote added successfull" : "upvote removed successfull",
    data: result,
  });
});

export const PostVoteController = {
  votePost,
};
