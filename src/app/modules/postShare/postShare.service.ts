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

export const PostShareService = {
  sharePost,
};
