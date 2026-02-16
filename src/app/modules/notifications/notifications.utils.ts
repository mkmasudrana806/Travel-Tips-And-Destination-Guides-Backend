import { NotificationType } from "./notifications.interface";

// notification message template
const notificationTemplates = {
  travel_request: ({ senderName, destination }: MessageData) =>
    `${senderName} requested to join your ${destination} trip`,
  request_accepted: ({ senderName }: MessageData) =>
    `${senderName} accepted your request for joining trip`,
  request_rejected: ({ senderName }: MessageData) =>
    `${senderName} rejected your request for joining trip`,
  post_comment: ({ senderName }: MessageData) =>
    `${senderName} commented on your post`,
  post_upvote: ({ senderName }: MessageData) =>
    `${senderName} upvoted your post`,
  new_follower: ({ senderName }: MessageData) => `${senderName} followed you`,
};

type MessageData = {
  senderName: string;
  destination: string;
};

/**
 * -------- notification message builder ------------
 *
 * @param type type of the notification
 * @param data sender and destination name
 * @returns a message
 */
export const buildNotificationMessage = (
  type: NotificationType,
  data: MessageData,
): string => {
  return notificationTemplates[type](data);
};
