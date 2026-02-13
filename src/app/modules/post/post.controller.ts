import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import { PostServices } from "./post.service";
import { TfileUpload } from "../../interface/fileUploadType";

// --------------- create a post --------------
const createPost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postData = req.body;
  const result = await PostServices.createPostIntoDB(userId, postData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

// -------------- get all posts ------------
const getAllPosts = asyncHanlder(async (req, res) => {
  const result = await PostServices.getAllPostsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: result,
  });
});

// -------------- get user posts ------------
const getUserPosts = asyncHanlder(async (req, res) => {
  const result = await PostServices.getUserPostsFromDB(
    req.params?.userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user posts retrieved successfully",
    data: result,
  });
});

// -------------- get single post ----------------
const getPost = asyncHanlder(async (req, res) => {
  const result = await PostServices.getSinglePostFromDB(req.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

// ------------ update single post ----------------
const updatePost = asyncHanlder(async (req, res) => {
  const result = await PostServices.updateAPostIntoDB(
    req.user,
    req.params?.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

// --------------- delete a post ----------------
const deletePost = asyncHanlder(async (req, res) => {
  const result = await PostServices.deleteAPostFromDB(req.user, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

// ------------------- upvote a post -------------------
// const upvotePost = asyncHanlder(async (req, res) => {
//   const result = await PostServices.upvotePostIntoDB(
//     req.user,
//     req.params.postId,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: result ? "upvote added successfull" : "upvote removed successfull",
//     data: result,
//   });
// });

// // ------------------- downvote a post -------------------
// const downvotePost = asyncHanlder(async (req, res) => {
//   const result = await PostServices.downvotePostIntoDB(
//     req.user,
//     req.params?.postId,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: result
//       ? "downvote added successfull"
//       : "downvote removed successfull",
//     data: result,
//   });
// });

export const PostControllers = {
  createPost,
  getAllPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  // upvotePost,
  // downvotePost,
};
