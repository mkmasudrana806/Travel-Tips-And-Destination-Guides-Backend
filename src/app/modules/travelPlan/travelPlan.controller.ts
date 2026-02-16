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

export const TravelPlanController = {
  createTravelPlan,
  getMyAllTravelPlans,
};
