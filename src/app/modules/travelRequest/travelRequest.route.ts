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

export const TravelRequestRoutes = router;
