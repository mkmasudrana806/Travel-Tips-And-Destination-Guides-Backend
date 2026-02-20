import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import mongoose from "mongoose";

import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";

// -------------- create a comment into db --------------
const createACommentIntoDB = async (userId: string, payload: TComment) => {
  // check post exists or not
  const post = await Post.findById(payload.post).populate("author", "_id");
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }
  payload.user = new mongoose.Types.ObjectId(userId);
  // TODO: check postId, if post exists
  const result = await Comment.create(payload);

  // create notification on comment
  await NotificationService.createNotification({
    recipient: post.author._id,
    sender: new mongoose.Types.ObjectId(userId),
    type: "post_comment",
    resourceType: "Post",
    resourceId: payload.post,
  });

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
