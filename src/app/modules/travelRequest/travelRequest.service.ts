import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import TravelPlan from "../travelPlan/travelPlan.model";
import TravelRequest from "./travelRequest.model";
import { TTravelRequest } from "./travelRequest.interface";

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
  payload: Partial<TTravelRequest>,
) => {
  const plan = await TravelPlan.findById(planId);

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
    ...payload,
  });

  return request;
};

/**
 * ---------- get all travel request for a plan -----------
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

export const TravelRequestService = {
  createTravelRequest,
  getAllRequestsForPlan,
};
