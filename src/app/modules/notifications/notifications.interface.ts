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
  message: string;
  resourceType: string;
  resourceId: string;
  isRead: boolean;
};

export type CreateNotificationPayload = {
  recipient: string;
  sender: string;
  type: NotificationType;
  resourceType: string;
  resourceId: string;
  senderName: string;
  destination?: string;
};
