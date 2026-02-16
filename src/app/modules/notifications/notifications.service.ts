import { CreateNotificationPayload } from "./notifications.interface";
import Notification from "./notifications.model";
import { buildNotificationMessage } from "./notifications.utils";

/**
 * ---------- create notification --------------
 *
 * @param payload payload contain notification meta data
 * @returns newly created notification data
 */
const createNotification = async (payload: CreateNotificationPayload) => {
  const message = buildNotificationMessage(payload.type, {
    senderName: payload.senderName,
    destination: payload.destination || "",
  });

  const result = Notification.create({
    recipient: payload.recipient,
    sender: payload.sender,
    type: payload.type,
    message,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    isRead: false,
  });

  return result;
};

export const NotificationService = {
  createNotification,
};
