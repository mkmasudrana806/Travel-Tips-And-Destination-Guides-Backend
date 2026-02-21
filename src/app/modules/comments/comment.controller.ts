import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CommentServices } from "./comment.service";

// ------------------- create a comment -------------------
const createAComment = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await CommentServices.createACommentIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment posted is successfull",
    data: result,
  });
});

// --------------- get all comments for a post (paginated) -------------------
const getAllComments = asyncHanlder(async (req, res) => {
  const query = req.query;
  const postId = req.body.post;
  const result = await CommentServices.getAllCommentsFromDB(postId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Comments retrieved successfull",
    data: result,
  });
});

// --------------- get replies of a comment -------------------
const getRepliesOfComment = asyncHanlder(async (req, res) => {
  const commentId = req.params.commentId;
  const query = req.query;
  const result = await CommentServices.getRepliesOfComment(commentId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Replies of a comment retrieved successfull",
    data: result,
  });
});

// ------------------- delete a comment -------------------
const deleteAComment = asyncHanlder(async (req, res) => {
  const userId = req.user?.userId;
  const commentId = req.params?.id;
  const result = await CommentServices.deleteACommentIntoDB(userId, commentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfull",
    data: result,
  });
});

// ------------------- update a comment -------------------
const updateAComment = asyncHanlder(async (req, res) => {
  const _id = req.params?.id;
  const result = await CommentServices.updateACommentIntoDB({
    _id,
    ...req.body,
  });

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
