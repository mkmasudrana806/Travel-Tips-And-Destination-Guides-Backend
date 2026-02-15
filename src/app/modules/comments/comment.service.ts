import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { COMMENT_ALLOWED_FIELDS_TO_UPDATE } from "./comment.constant";

// -------------- create a comment into db --------------
const createACommentIntoDB = async (
  userData: JwtPayload,
  payload: TComment,
) => {
  payload.user = userData?.user;
  // TODO: check postId, if post exists
  const result = await Comment.create(payload);
  return result;
};

// -------------- get all comments   --------------
const getAllCommentsFromDB = async () => {
  const result = await Comment.find({}).populate({
    path: "user",
    select: "_id name email isVerified profilePicture premiumAccess",
  });
  return result;
};

// -------------- get all comments for all posts  --------------
const getAllCommentsForPostsFromDB = async (postIds: string[]) => {
  const objectIds = postIds.map((id) => new mongoose.Types.ObjectId(id));
  const commentsCount = await Comment.aggregate([
    {
      $match: { post: { $in: objectIds } },
    },
    {
      $group: {
        _id: "$post",
        count: { $sum: 1 },
      },
    },
  ]);

  return commentsCount;
};

// -------------- get all comments of a post --------------
const getAllCommentsOfPostFromDB = async (postId: string) => {
  const result = await Comment.find({ post: postId }).populate({
    path: "user",
    select: "_id name email isVerified profilePicture premiumAccess",
  });
  return result;
};

// -------------- delete a comment --------------
const deleteACommentIntoDB = async (user: string, commentId: string) => {
  const result = await Comment.findOneAndDelete({
    _id: commentId,
    user,
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to delete");
  }
  return true;
};

// -------------- update a comment --------------
const updateACommentIntoDB = async (payload: Partial<TComment>) => {
  const result = await Comment.findOneAndUpdate(
    { _id: payload?._id, post: payload?.post },
    { comment: payload?.comment },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to update!");
  }
  return result;
};

export const CommentServices = {
  createACommentIntoDB,
  getAllCommentsFromDB,
  getAllCommentsForPostsFromDB,
  getAllCommentsOfPostFromDB,
  deleteACommentIntoDB,
  updateACommentIntoDB,
};
