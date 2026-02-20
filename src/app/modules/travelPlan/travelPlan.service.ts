import mongoose from "mongoose";
import { TTravelPlan } from "./travelPlan.interface";
import TravelPlan from "./travelPlan.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { buildTravelPlanFilter, getTravelDays } from "./travelPlan.utils";

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

  // travel days calculate and validated based on startDate and endDate
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
 * ----------- get a travel plan details =-=--------------
 *
 * @param planId single plan id to view
 * @returns single plan data
 */
const getSingleTravelPlan = async (planId: string) => {
  const result = await TravelPlan.findById(planId).populate(
    "user",
    "name profilePicture",
  );
  return result;
};

/**
 * ----------- get all travel plans (public route) --------------
 *
 * dynamically return all travel plans based on user queries
 *
 * @param query different user queries params
 * @return return filtered all travel plans
 */
const getAllTravelPlansFiltered = async (query: Record<string, unknown>) => {
  const filter = buildTravelPlanFilter(query);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await TravelPlan.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await TravelPlan.find(filter).countDocuments();
  const meta = { page, limit, total };
  return { meta, result };
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
  if (payload.startDate && payload.endDate) {
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
    { _id: planId, user: userId, status: "open" },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Travel plan not found or already closed!",
    );
  }
  return result;
};

/**
 * ------------- delete a travel plan ----------------
 *
 * @param userId user want to delete the plan
 * @param planId plan id which to be deleted
 * @returns deleted plan data
 */
const deleteTravelPlan = async (userId: string, planId: string) => {
  const result = await TravelPlan.findOneAndDelete({
    _id: planId,
    user: userId,
  });
  return result;
};

export const TravelPlanService = {
  createTravelPlan,
  getAllTravelPlansFiltered,
  getSingleTravelPlan,
  getMyAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};
