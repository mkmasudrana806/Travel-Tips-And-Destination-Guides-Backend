import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import asyncHanlder from "../../utils/asyncHandler";
import { TravelRequestService } from "./travelRequest.service";

// ---------------- create a travel request ---------------
const createTravelRequest = asyncHanlder(async (req, res) => {
  const travelPlanId = req.params.planId;
  const requesterId = req.user.userId;
  const requestNote = req.body.requestNote;
  console.log(requesterId, travelPlanId, requestNote);
  const result = await TravelRequestService.createTravelRequest(
    travelPlanId,
    requesterId,
    requestNote,
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
  const query = req.query;
  const result = await TravelRequestService.getAllRequestsForPlan(
    planId,
    userId,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All requests for a plan retrived sucessfully",
    data: result,
  });
});

// ------------- update partner's request (accepted/rejected) -------------------
const updateTravelRequestStatus = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.requestId;
  const payload = req.body;
  const result = await TravelRequestService.updateTravelRequestStatus(
    userId,
    requestId,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: `Partner request is ${result.status}`,
    data: result,
  });
});

// ------------- accept/reject a travel partner request -------------------
const getTravelRequestsForAnUser = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const result = await TravelRequestService.getTravelRequestsForAnUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All requested trip sharing retrived sucessfull",
    data: result,
  });
});

export const TravelRequestController = {
  createTravelRequest,
  getAllRequestsForPlan,
  updateTravelRequestStatus,
  getTravelRequestsForAnUser,
};
