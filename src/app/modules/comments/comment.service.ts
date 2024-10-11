import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import { JwtPayload } from "jsonwebtoken";

import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { COMMENT_ALLOWED_FIELDS_TO_UPDATE } from "./comment.constant";

// -------------- create a comment into db --------------
const createACommentIntoDB = async (
  userData: JwtPayload,
  payload: TComment
) => {
  payload.userId = userData?.userId;
  // TODO: check postId, if post exists
  const result = await Comment.create(payload);
  return result;
};

// -------------- get all comments   --------------
const getAllCommentsFromDB = async () => {
  const result = await Comment.find({}).populate({
    path: "userId",
    select: "_id name email isVerified profilePicture",
  });
  return result;
};

// -------------- get all comments of a post --------------
const getAllCommentsOfPostFromDB = async (postId: string) => {
  const result = await Comment.find({ postId: postId }).populate({
    path: "userId",
    select: "_id name email isVerified profilePicture",
  });
  return result;
};

// -------------- delete a comment --------------
const deleteACommentIntoDB = async (userId: string, commentId: string) => {
  const result = await Comment.findOneAndDelete({
    _id: commentId,
    userId,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to delete");
  }

  return result;
};

// -------------- update a comment --------------
const updateACommentIntoDB = async (
  userId: string,
  commentId: string,
  payload: TComment
) => {
  const allowedUpdatedData = makeAllowedFieldData<TComment>(
    COMMENT_ALLOWED_FIELDS_TO_UPDATE,
    payload
  );

  const result = await Comment.findOneAndUpdate(
    { _id: commentId, userId: userId },
    allowedUpdatedData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to update!");
  }
  return result;
};

export const CommentServices = {
  createACommentIntoDB,
  getAllCommentsFromDB,
  getAllCommentsOfPostFromDB,
  deleteACommentIntoDB,
  updateACommentIntoDB,
};
