import httpStatus, { FORBIDDEN } from "http-status";
import AppError from "../../utils/AppError";
import TravelPlan from "../travelPlan/travelPlan.model";
import TravelRequest from "./travelRequest.model";
import { TTravelRequest } from "./travelRequest.interface";
import { NotificationService } from "../notifications/notifications.service";
import mongoose, { Schema, Types } from "mongoose";
import { User } from "../user/user.model";
import { NotificationType } from "../notifications/notifications.interface";

/**
 * ----------- create a travel request with note -------------
 *
 * @param planId travel plan to request
 * @param requesterId who request for a trip
 * @param requestNote a user note with request
 * @returns newly created data
 */
const createTravelRequest = async (
  planId: string,
  requesterId: string,
  payload: string,
) => {
  const plan = await TravelPlan.findById(planId).populate("user", "name");

  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found");
  }

  // prevent author requesting own plan
  if (plan.user.toString() === requesterId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot request your own travel plan",
    );
  }

  const request = await TravelRequest.create({
    travelPlan: planId,
    requester: requesterId,
    requestNote: payload,
  });

  try {
    // create notification
    await NotificationService.createNotification({
      recipient: plan.user,
      sender: new mongoose.Types.ObjectId(requesterId),
      type: "travel_request",
      resourceType: "TravelPlan",
      resourceId: plan._id,
    });
  } catch (error) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Failed to create notification for TRAVEL_REQUEST",
    );
  } finally {
    return request;
  }
};

/**
 * ---------- get all travel request for a plan (author side) -----------
 *
 * @param planId travel plan id to get all its request
 * @param userId the owner of that travel plan
 */
const getAllRequestsForPlan = async (planId: string, userId: string) => {
  const plan = await TravelPlan.findById(planId);
  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found");
  }
  // you have no access to this travel plan.
  if (plan.user.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }
  const requests = await TravelRequest.find({
    travelPlan: planId,
  })
    .populate("requester", "name profilePicture")
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * --------- aceept/reject travel request ------------
 *
 * @param requestId which request to be accepted
 * @param authorId author who want to accept a request
 * @param payload new status
 * @returns updated travelRequest data
 */
const acceptRejectTravelRequest = async (
  authorId: string,
  requestId: string,
  payload: Partial<TTravelRequest>,
) => {
  // status transition
  const statusTransition: Record<string, string[]> = {
    pending: ["accepted", "rejected"],
  };

  const travelRequest = await TravelRequest.findOne({
    _id: requestId,
  }).populate("travelPlan");

  if (!travelRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found");
  }

  const plan = travelRequest.travelPlan as any;
  // check author ownership
  if (plan.user.toString() !== authorId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }

  if (!payload.status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
  }

  // check only allowed transition
  const allowedTransition: string[] = statusTransition[travelRequest.status];
  if (!allowedTransition || !allowedTransition.includes(payload.status)) {
    throw new AppError(
      FORBIDDEN,
      `Cannot change status from ${travelRequest.status} to ${payload.status}`,
    );
  }
  travelRequest.status = payload.status;
  await travelRequest.save();

  // notification
  const typeSelect: Record<string, NotificationType> = {
    accepted: "request_accepted",
    rejected: "request_rejected",
  };

  try {
    await NotificationService.createNotification({
      recipient: travelRequest.requester,
      sender: new mongoose.Types.ObjectId(authorId),
      type: typeSelect[payload.status],
      resourceType: "TravelRequest",
      resourceId: travelRequest._id,
    });
  } catch (error) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Failed to create notification for TRAVEL_REQUEST",
    );
  } finally {
    return travelRequest;
  }
};

/**
 * ----------- get all requested trip for an user (user side) --------------
 *
 * @param requesterId requester id, who want to see the status of requested travel plan
 * @returns lists of requested travel trips
 */
const getTravelRequestsForAnUser = async (requesterId: string) => {
  const result = await TravelRequest.find({
    requester: requesterId,
  })
    .populate({
      path: "travelPlan",
      populate: {
        path: "user",
        select: "name profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return result;
};

export const TravelRequestService = {
  createTravelRequest,
  getAllRequestsForPlan,
  acceptRejectTravelRequest,
  getTravelRequestsForAnUser,
};
