import { Types } from "mongoose";

// notification type
export type NotificationType =
  | "travel_request"
  | "request_accepted"
  | "request_rejected"
  | "post_comment"
  | "post_upvote"
  | "new_follower";

// notification
export type TNotification = {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  resourceType: string;
  resourceId: Types.ObjectId;
  isRead: boolean;
};

export type CreateNotificationPayload = {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  resourceType: string;
  resourceId: Types.ObjectId;
};
