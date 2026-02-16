import express from "express";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { TravelRequestController } from "./travelRequest.controller";
import { TravelRequestValidation } from "./travelRequest.validation";
const router = express.Router();

// create a travel request
router.post(
  "/plans/:planId/request",
  auth("user"),
  validateRequestData(TravelRequestValidation.createTravelRequest),
  TravelRequestController.createTravelRequest,
);

// get all request for a plan
router.get(
  "/plans/:planId/requests",
  auth("user"),
  TravelRequestController.getAllRequestsForPlan,
);

// accept or reject a partner request
router.patch(
  "/:requestId/accept-reject",
  auth("user"),
  validateRequestData(TravelRequestValidation.acceptRejectPartnerRequest),
  TravelRequestController.acceptRejectTravelRequest,
);

export const TravelRequestRoutes = router;
