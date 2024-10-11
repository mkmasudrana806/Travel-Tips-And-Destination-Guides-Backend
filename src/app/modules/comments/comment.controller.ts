import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CommentServices } from "./comment.service";

// ------------------- create a comment -------------------
const createAComment = asyncHanlder(async (req, res) => {
  const result = await CommentServices.createACommentIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment posted is successfull",
    data: result,
  });
});

// --------------- get all comments -------------------
const getAllComments = asyncHanlder(async (req, res) => {
  const result = await CommentServices.getAllCommentsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Comments retrieved successfull",
    data: result,
  });
});

// --------------- get all comments of a post -------------------
const getAllCommentsOfPost = asyncHanlder(async (req, res) => {
  const result = await CommentServices.getAllCommentsOfPostFromDB(
    req.params?.postId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Comments of a post retrieved successfull",
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
  const userId = req.user?.userId;
  const commentId = req.params?.id;
  const result = await CommentServices.updateACommentIntoDB(
    userId,
    commentId,
    req.body
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
  getAllCommentsOfPost,
  deleteAComment,
  updateAComment,
};
