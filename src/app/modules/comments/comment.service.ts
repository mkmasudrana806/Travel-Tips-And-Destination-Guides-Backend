import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import mongoose from "mongoose";
import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";

/**
 * -------------- create a comment into db --------------
 *
 * @param userId user who want to comment
 * @param payload payload for comment
 * @returns new comment data
 */
const createACommentIntoDB = async (userId: string, payload: TComment) => {
  const { content, parentComment } = payload;

  // check post exists or not
  const post = await Post.findById(payload.post).populate("author", "_id");
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }
  payload.user = new mongoose.Types.ObjectId(userId);

  // scalable way to comment
  const MAX_DEPTH = 3; // maximum depth for replies
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let depth = 0;

    // check if replying to a comment
    if (parentComment) {
      const parent = await Comment.findById(parentComment).session(session);

      if (!parent) {
        throw new Error("Parent comment not found");
      }
      if (parent.depth >= MAX_DEPTH) {
        throw new Error("Maximum reply depth exceeded");
      }

      depth = parent.depth + 1;

      // increment reply count atomically
      await Comment.findByIdAndUpdate(
        parentComment,
        { $inc: { replyCount: 1 } },
        { session },
      );
    }

    const newComment = await Comment.create(
      [
        {
          post: post,
          user: userId,
          content,
          parentComment: parentComment || null,
          depth,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // create notification on comment
    await NotificationService.createNotification({
      recipient: post.author._id,
      sender: new mongoose.Types.ObjectId(userId),
      type: "post_comment",
      resourceType: "Post",
      resourceId: payload.post,
    });

    return newComment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create comment",
    );
  }
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
    { comment: payload?.content },
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
