import { Request, Response } from "express";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

// not found route
const notFoundRoute = (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    message: "API NOT FOUND",
    data: {},
  });
};

export default notFoundRoute;
