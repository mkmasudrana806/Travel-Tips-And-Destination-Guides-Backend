import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CommentServices } from "./comment.service";
import validateObjectId from "../../utils/validateObjectId";

// ------------------- create a comment -------------------
const createAComment = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const payload = req.body;
  // validate mongoose object id
  validateObjectId({ name: "post id", value: postId });

  const result = await CommentServices.createAComment(userId, postId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment posted is successfull",
    data: result,
  });
});

// --------------- get all comments for a post (paginated) -------------------
const getAllComments = asyncHanlder(async (req, res) => {
  const viewerId = req.user.userId;
  const query = req.query;
  const postId = req.params.postId;
  // validate mongoose object id
  validateObjectId({ name: "post id", value: postId });

  const result = await CommentServices.getAllComments(viewerId, postId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Comments retrieved successfull",
    data: result,
  });
});

// --------------- get replies of a comment -------------------
const getRepliesOfComment = asyncHanlder(async (req, res) => {
  const viewerId = req.user.userId;
  const commentId = req.params.commentId;
  const query = req.query;
  // validate mongoose object id
  validateObjectId({ name: "comment id", value: commentId });

  const result = await CommentServices.getRepliesOfComment(viewerId, commentId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Replies of a comment retrieved successfull",
    data: result,
  });
});

// ------------------- delete a comment -------------------
const deleteAComment = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const commentId = req.params.commentId;
  // validate mongoose object id
  validateObjectId({ name: "comment id", value: commentId });

  const result = await CommentServices.deleteAComment(commentId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfull",
    data: result,
  });
});

// ------------------- update a comment -------------------
const updateAComment = asyncHanlder(async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.userId;
  const payload = req.body;
  // validate comment id
  validateObjectId({ name: "comment id", value: commentId });

  const result = await CommentServices.updateAComment(
    commentId,
    userId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfull",
    data: result,
  });
});

export const CommentControllers = {
  createAComment,
  getAllComments,
  getRepliesOfComment,
  deleteAComment,
  updateAComment,
};
