import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { PostVoteServices } from "../postVote/postVote.service";
import { PostShareService } from "./postShare.service";

// -------------- share a post ------------
const sharePost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const data = req.body;
  const result = await PostShareService.sharePost(userId, postId, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "post share successfull",
    data: result,
  });
});

export const PostShareController = {
  sharePost,
};
