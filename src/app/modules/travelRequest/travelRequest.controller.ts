import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import asyncHanlder from "../../utils/asyncHandler";
import { TravelRequestService } from "./travelRequest.service";

// ---------------- create a travel request ---------------
const createTravelRequest = asyncHanlder(async (req, res) => {
  const requesterId = req.user.userId;
  const travelPlanId = req.params.planId;
  const data = req.body;
  const result = await TravelRequestService.createTravelRequest(
    travelPlanId,
    requesterId,
    data,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Trip request sucessfull",
    data: result,
  });
});

// ------------- get all requets of a plan -------------------
const getAllRequestsForPlan = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const planId = req.params.planId;
  const result = await TravelRequestService.getAllRequestsForPlan(
    planId,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All requests for a plan retrived sucessfully",
    data: result,
  });
});

export const TravelRequestController = {
  createTravelRequest,
  getAllRequestsForPlan,
};
