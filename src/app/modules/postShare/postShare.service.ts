import { NotificationService } from "../notifications/notifications.service";
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
  const share = await PostShare.create({
    post: new Types.ObjectId(postId),
    user: new Types.ObjectId(userId),
    caption: payload.caption,
  });

  return share;
};

export const PostShareService = {
  sharePost,
};
