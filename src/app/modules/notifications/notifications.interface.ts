import { Types } from "mongoose";

// notification type
export type NotificationType =
  | "travel_request"
  | "request_accepted"
  | "request_rejected"
  | "post_comment"
  | "post_upvote"
  | "new_follower";

// resource name I mean module name
export type TResourceType =
  | "User"
  | "Post"
  | "Comment"
  | "TravelPlan"
  | "TravelRequest";

// notification
export type TNotification = {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  resourceType: TResourceType;
  resourceId: Types.ObjectId;
  isRead: boolean;
};
