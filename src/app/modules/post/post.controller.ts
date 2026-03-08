import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import { PostServices } from "./post.service";
import validateObjectId from "../../utils/validateObjectId";

// --------------- create a post --------------
const createPost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postData = req.body;
  const result = await PostServices.createPost(userId, postData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

// --------------- get all travel posts ----------------
const getAllTravelPosts = asyncHanlder(async (req, res) => {
  const viewerId = req.user.userId;
  const query = req.query;
  const { data, meta } = await PostServices.getAllTravelPosts(viewerId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Filtered post retrived successfully",
    data: data,
    meta: meta,
  });
});

// -------------- get my all posts ------------
const getMyPosts = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const query = req.query;
  const { data, meta } = await PostServices.getMyPosts(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user posts retrieved successfully",
    data: data,
    meta: meta,
  });
});

// -------------- get single post ----------------
const getSinglePost = asyncHanlder(async (req, res) => {
  const postId = req.params.postId;
  const viewerId = req.user.userId;
  // validate params id
  validateObjectId({ name: "post id", value: postId });

  const { data, viewerContext } = await PostServices.getSinglePost(
    postId,
    viewerId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data,
    viewerContext,
  });
});

// ------------ update single post ----------------
const updatePost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const newData = req.body;
  // validate params id
  validateObjectId({ name: "post id", value: postId });

  const result = await PostServices.updateAPost(userId, postId, newData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

// --------------- delete a post ----------------
const deletePost = asyncHanlder(async (req, res) => {
  const postId = req.params.postId;
  // validate params id
  validateObjectId({ name: "post id", value: postId });

  const result = await PostServices.deleteAPost(req.user, postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

export const PostControllers = {
  createPost,
  getAllTravelPosts,
  getMyPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
