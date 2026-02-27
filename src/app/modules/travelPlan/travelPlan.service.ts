import mongoose from "mongoose";
import {
  TAllPlansResponse,
  TTravelPlan,
  TViewerContextTravelPlan,
} from "./travelPlan.interface";
import TravelPlan from "./travelPlan.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { buildTravelPlanFilter, getTravelDays } from "./travelPlan.utils";
import TravelRequest from "../travelRequest/travelRequest.model";

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
const getSingleTravelPlan = async (planId: string, viewerId?: string) => {
  const [plan, travelRequest] = await Promise.all([
    TravelPlan.findById(planId).populate("user", "name profilePicture").lean(),
    viewerId
      ? TravelRequest.findOne({
          travelPlan: planId,
          requester: viewerId,
        })
          .select("status")
          .lean()
      : null,
  ]);

  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Travle plan is not found!");
  }

  // check is Owner
  const isOwner = plan.user._id.toString() === viewerId;

  // has requested
  const requestStatus = isOwner ? "none" : (travelRequest?.status ?? "none");

  // return plan data with viewer meta data
  const viewerContext: TViewerContextTravelPlan = {
    isOwner,
    requestStatus,
  };
  return { data: plan, viewerContext };
};

/**
 * ----------- get all travel plans (public route) --------------
 * dynamically return all travel plans based on user queries
 *
 * @param viewerId who is viewing all travel plans
 * @param query different user queries params
 * @return return filtered all travel plans
 */
const getAllTravelPlans = async (
  viewerId: string,
  query: Record<string, unknown>,
) => {
  // pagination
  const filter = buildTravelPlanFilter(query);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // fetch plans and populate who created
  const plans = await TravelPlan.find(filter)
    .populate("user", "name profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await TravelPlan.find(filter).countDocuments();
  const meta = { page, limit, total };

  // response structure
  let data: TAllPlansResponse[];

  // if viewer not logged in. viewer context will be default settings
  if (!viewerId) {
    data = plans.map((plan) => {
      return {
        data: plan,
        viewerContext: {
          isOwner: false,
          requestStatus: "none",
        },
      };
    });
    return { data, meta };
  }

  // if viewerId present. means he can be either plan owner or an user.
  // for onwer: { isOwner: true, isParticipant: false, hasRequested: false}
  // for user: { isOwner: false, isParticipant: true, hasRequested: true/false}
  const planIds = plans.map((plan) => plan._id);

  // fetch all request belong to the viewerId
  const requests = await TravelRequest.find({
    travelPlan: { $in: planIds },
    requester: viewerId,
  })
    .select("travelPlan status")
    .lean();

  // create a set to fast lookup to check hasRequested
  const requestStatusMap = new Map(
    requests.map((req) => [req.travelPlan.toString(), req.status]),
  );
  // make data formatted for logged in user
  data = plans.map((plan) => {
    const isOwner = plan.user._id.toString() === viewerId;
    const requestStatus = isOwner
      ? "none"
      : (requestStatusMap.get(plan._id.toString()) ?? "none");
    return {
      data: plan,
      viewerContext: {
        isOwner,
        requestStatus: requestStatus,
      },
    };
  });

  // return data for logged-in user
  return { meta, data };
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
  getAllTravelPlans,
  getSingleTravelPlan,
  getMyAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};
