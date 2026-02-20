import { model, Schema } from "mongoose";
import { TNotification } from "./notifications.interface";

const notificationTypes = [
  "travel_request",
  "request_accepted",
  "request_rejected",
  "post_comment",
  "post_upvote",
  "new_follower",
];

const notificationSchema = new Schema<TNotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: notificationTypes,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["User", "Post", "Comment", "TravelPlan", "TravelRequest"],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = model<TNotification>("Notification", notificationSchema);
export default Notification;
