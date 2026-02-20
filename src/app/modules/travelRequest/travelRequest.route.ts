import express from "express";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { TravelRequestController } from "./travelRequest.controller";
import { TravelRequestValidation } from "./travelRequest.validation";
const router = express.Router();
const routerPlan = express.Router({ mergeParams: true });

// routerPlan = "/travel-plans/:planId/requests"
// create a travel request
routerPlan.post(
  "/",
  auth("user"),
  validateRequestData(TravelRequestValidation.createTravelRequest),
  TravelRequestController.createTravelRequest,
);

// get all requests for a plan
routerPlan.get(
  "/",
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

// get my all requested travel plan
router.get(
  "/me",
  auth("user"),
  TravelRequestController.getTravelRequestsForAnUser,
);

// route for plan request
export const TravelRequestRoutes = router;

// nested routes for travel plan
export const PlanRequestRoutes = routerPlan;
