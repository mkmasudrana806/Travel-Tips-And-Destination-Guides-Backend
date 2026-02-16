import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { TravelPlanService } from "./travelPlan.service";

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
  const result = await TravelPlanService.updateTravelPlan(userId, planId, data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "travel plan updated sucessfull",
    data: result,
  });
});

// ---------------- clsoe my travel plan ---------------
const closeTravelPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const planId = req.params.planId;
  const result = await TravelPlanService.closeTravelPlan(userId, planId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "travel plan closed sucessfull",
    data: result,
  });
});

// ---------------- delete my travel plan ---------------
const deleteTravelPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const planId = req.params.planId;
  const result = await TravelPlanService.deleteTravelPlan(userId, planId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "travel plan deleted sucessfull",
    data: result,
  });
});

export const TravelPlanController = {
  createTravelPlan,
  getMyAllTravelPlans,
  updateTravelPlan,
  closeTravelPlan,
  deleteTravelPlan,
};
