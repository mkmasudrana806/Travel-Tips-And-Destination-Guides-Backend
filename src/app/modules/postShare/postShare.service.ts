import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";
import { TPostShare } from "./postShare.interface";
import { PostShare } from "./postShare.model";
import { Schema, Types } from "mongoose";

/**
 * ------------- share a travel post -------------
 *
 * @param postId post id to share
 * @param userId who will share a post
 * @param caption optional caption with share
 * @returns newly shared data
 */
const sharePost = async (
  postId: string,
  userId: string,
  payload: Partial<TPostShare>,
) => {
  // check post exists
  const post = await Post.findById(postId).select("author").lean();
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }

  const share = await PostShare.create({
    post: post._id,
    user: post.author,
    caption: payload.caption,
  });

  // add notification
  await NotificationService.createNotification({
    recipient: post.author,
    sender: new Types.ObjectId(userId),
    type: "post_share",
    resourceType: "Post",
    resourceId: post._id,
  });
  return share;
};

/**
 * ------------ delete a shared post
 *
 * @param userId who want to deleted shared post
 * @param sharedPostId which shared post need to delete
 * @returns status
 */
const deleteSharedPost = async (userId: string, sharedPostId: string) => {
  const deletedPost = await PostShare.findOneAndDelete({
    _id: sharedPostId,
    user: userId,
  }).lean();
  if (!deletedPost) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already deleted or not found!");
  }

  return { isDeleted: true };
};

/**
 *
 * @param postId post to shows all shares
 * @param query page, limit by default
 * @returns paginated shared posts
 */
const getSharedPosts = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await PostShare.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("post")
    .populate("user", "name profilePicture");
  const total = await PostShare.countDocuments();

  return {
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};
export const PostShareService = {
  sharePost,
  deleteSharedPost,
  getSharedPosts,
};
