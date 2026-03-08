import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import asyncHanlder from "../../utils/asyncHandler";
import { TravelRequestService } from "./travelRequest.service";
import validateObjectId from "../../utils/validateObjectId";

// ---------------- create a travel request ---------------
const createTravelRequest = asyncHanlder(async (req, res) => {
  const travelPlanId = req.params.planId;
  const requesterId = req.user.userId;
  const requestNote = req.body.requestNote;
  // validate params id
  validateObjectId({ name: "travelPlan id", value: travelPlanId });

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
  // validate params id
  validateObjectId({ name: "plan id", value: planId });

  const { meta, data } = await TravelRequestService.getAllRequestsForPlan(
    planId,
    userId,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All requests for a plan retrived sucessfully",
    data: data,
    meta: meta,
  });
});

// ------------- update partner's request (accepted/rejected) -------------------
const updateTravelRequestStatus = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.requestId;
  const payload = req.body;
  // validate params id
  validateObjectId({ name: "request id", value: requestId });

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

// ------------- update partner's request (accepted/rejected) -------------------
const cancelTravelRequest = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.requestId;
  const payload = req.body;
  // validate params id
  validateObjectId({ name: "request id", value: requestId });

  const result = await TravelRequestService.cancelTravelRequest(
    userId,
    requestId,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Request cancelled Sucessfull",
    data: result,
  });
});

// ------------- lists of travel requests made an user -------------------
const getTravelRequestsForAnUser = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const query = req.query;
  const { meta, data } = await TravelRequestService.getTravelRequestsForAnUser(
    userId,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All requested trip sharing retrived sucessfull",
    data: data,
    meta: meta,
  });
});

export const TravelRequestController = {
  createTravelRequest,
  getAllRequestsForPlan,
  updateTravelRequestStatus,
  cancelTravelRequest,
  getTravelRequestsForAnUser,
};
