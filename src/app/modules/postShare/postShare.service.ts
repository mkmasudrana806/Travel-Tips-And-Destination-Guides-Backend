import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";
import { TPostShare } from "./postShare.interface";
import { PostShare } from "./postShare.model";
import { Schema, Types } from "mongoose";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { POST_SHARE_QUERY_OPTIONS } from "./postShare.query";

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
 * ----------- get all shares of a post ---------------
 *
 * @param postId post to shows all shares
 * @param query page, limit by default
 * @returns paginated shared posts
 */
const getSharesOfPost = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    PostShare.find({ post: postId }),
    query,
    POST_SHARE_QUERY_OPTIONS,
  )
    .sort()
    .paginate()
    .populate([
      { path: "post" },
      { path: "user", select: "name profilePicture" },
    ])
    .lean();

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return {
    data,
    meta,
  };
};
export const PostShareService = {
  sharePost,
  deleteSharedPost,
  getSharesOfPost,
};
