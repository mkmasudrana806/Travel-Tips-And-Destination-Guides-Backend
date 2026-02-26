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
  const result = await PostShareService.sharePost(postId, userId, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "post share successfull",
    data: result,
  });
});

// -------------- delete shared post ------------
const deleteSharedPost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const sharedPostId = req.params.sharedPostId;
  const result = await PostShareService.deleteSharedPost(userId, sharedPostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "post deleted successfull",
    data: result,
  });
});

// -------------- delete shared post ------------
const getSharedPosts = asyncHanlder(async (req, res) => {
  const postId = req.params.postId;
  const query = req.query;
  const result = await PostShareService.getSharedPosts(postId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "post deleted successfull",
    data: result,
  });
});

export const PostShareController = {
  sharePost,
  deleteSharedPost,
  getSharedPosts,
};
