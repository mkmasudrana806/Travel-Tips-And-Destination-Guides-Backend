import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { PostShareService } from "./postShare.service";
import validateObjectId from "../../utils/validateObjectId";

// -------------- share a post ------------
const sharePost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const data = req.body;
  // validate params id
  validateObjectId({ name: "post id", value: postId });

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
  // validate params id
  validateObjectId({ name: "sharedPost id", value: sharedPostId });

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
  // validate params id
  validateObjectId({ name: "post id", value: postId });

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
