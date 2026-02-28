import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { TravelPlanService } from "./travelPlan.service";
import validateObjectId from "../../utils/validateObjectId";

// ---------------- create a travel plan ---------------
const createTravelPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;
  const result = await TravelPlanService.createTravelPlan(userId, data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Travel plan is created",
    data: result,
  });
});

// ---------------- get single travel plan details ---------------
const getSingleTravelPlan = asyncHanlder(async (req, res) => {
  const viewerId = req.user.userId;
  const planId = req.params.planId;
  // validate params id
  validateObjectId({ name: "plan id", value: planId });

  const { data, viewerContext } = await TravelPlanService.getSingleTravelPlan(
    planId,
    viewerId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Travel plan is retrieved",
    data: data,
    viewerContext,
  });
});

// ---------------- get my all travel plans ---------------
const getMyAllTravelPlans = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const query = req.query;
  const result = await TravelPlanService.getMyAllTravelPlans(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All travel plans retrived sucessfull",
    data: result,
  });
});

// ---------------- update my travel plan ---------------
const updateTravelPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const planId = req.params.planId;
  const data = req.body;
  // validate params id
  validateObjectId({ name: "plan id", value: planId });

  const result = await TravelPlanService.updateTravelPlan(userId, planId, data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "travel plan updated sucessfull",
    data: result,
  });
});

// ---------------- delete my travel plan ---------------
const deleteTravelPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const planId = req.params.planId;
  // validate params id
  validateObjectId({ name: "plan id", value: planId });

  const result = await TravelPlanService.deleteTravelPlan(userId, planId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "travel plan deleted sucessfull",
    data: result,
  });
});

// ---------------- get all travel plans ---------------
const getAllTravelPlans = asyncHanlder(async (req, res) => {
  const viewerId = req.user.userId;
  const query = req.query;
  const { data, meta } = await TravelPlanService.getAllTravelPlans(
    viewerId,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All plans retrieved sucessfull",
    data,
    meta,
  });
});

export const TravelPlanController = {
  createTravelPlan,
  getSingleTravelPlan,
  getMyAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
  getAllTravelPlans,
};
