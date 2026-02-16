import mongoose from "mongoose";
import { TTravelPlan } from "./travelPlan.interface";
import TravelPlan from "./travelPlan.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { getTravelDays } from "./travelPlan.utils";

/**
 * ------------- create a travel plan -------------
 *
 * @param userId user who want to create travel plan
 * @param payload travel plan data
 * @returns created plan
 */
const createTravelPlan = async (
  userId: string,
  payload: Partial<TTravelPlan>,
) => {
  payload.user = new mongoose.Types.ObjectId(userId);

  // travel days calculate and validate
  payload.travelDays = getTravelDays(payload.startDate, payload.endDate);

  // budget validation
  if (
    payload.minBudget &&
    payload.maxBudget &&
    payload.minBudget > payload.maxBudget
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Min budget should not greater than maxBudget!",
    );
  }

  const result = await TravelPlan.create(payload);
  return result;
};

/**
 * ------------ get my all travel plans ------------
 *
 * @param userId user who want to get his all plans
 * @param query query like status=open, status=close, destination=dhaka etc
 * @returns all listed travel plans
 */
const getMyAllTravelPlans = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  query.user = userId;
  const result = await TravelPlan.find(query).sort({ createdAt: -1 });
  return result;
};

/**
 *  ----------- update travel plans -----------
 *
 * @param userId user who want to update plan
 * @param planId plan id
 * @param payload updated data
 * @returns updated data
 */
const updateTravelPlan = async (
  userId: string,
  planId: string,
  payload: Partial<TTravelPlan>,
) => {
  // update travels days
  if (payload.startDate) {
    payload.travelDays = getTravelDays(payload.startDate, payload.endDate);
  }

  // budget validation
  if (
    payload.minBudget &&
    payload.maxBudget &&
    payload.minBudget > payload.maxBudget
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Min budget should not greater than maxBudget!",
    );
  }

  // only open travel plan should update
  const result = await TravelPlan.findOneAndUpdate(
    { _id: planId, user: userId },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

/**
 * ------------- close a travel plan ----------------
 *
 * @param userId user want to close the plan
 * @param planId plan id which to be closed
 * @returns closed plan data
 */
const closeTravelPlan = async (userId: string, planId: string) => {
  const result = await TravelPlan.findOneAndUpdate(
    { _id: planId, user: userId, status: "open" },
    { status: "close" },
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Travel plan is already deleted",
    );
  }
  return result;
};

export const TravelPlanService = {
  createTravelPlan,
  getMyAllTravelPlans,
  updateTravelPlan,
  closeTravelPlan,
};
