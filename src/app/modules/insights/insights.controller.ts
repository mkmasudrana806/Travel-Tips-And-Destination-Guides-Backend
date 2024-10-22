import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { InsightServices } from "./insights.services";

// ------------------- get user insights -------------------
const getUserInsights = asyncHanlder(async (req, res) => {
  const result = await InsightServices.getUserInsightsFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User insights retrieved Successfull",
    data: result,
  });
});

// ------------------- get admin insights -------------------
const getAdminInsights = asyncHanlder(async (req, res) => {
  const result = await InsightServices.getAdminInsightsFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin insights retrieved Successfull",
    data: result,
  });
});

// ------------------- get monthly overview -------------------
const getMonthlyOverview = asyncHanlder(async (req, res) => {
  const result = await InsightServices.getMonthlyOverviewFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin insights retrieved Successfull",
    data: result,
  });
});

export const InsightController = {
  getUserInsights,
  getAdminInsights,
  getMonthlyOverview,
};
