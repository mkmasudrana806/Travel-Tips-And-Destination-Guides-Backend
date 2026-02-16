import express from "express";
import auth from "../../middlewares/auth";
import { TravelPlanValidation } from "./travelPlan.validation";
import { TravelPlanController } from "./travelPlan.controller";
import validateRequestData from "../../middlewares/validateRequest";
const router = express.Router();

// create a travel plan
router.post(
  "/",
  auth("user"),
  validateRequestData(TravelPlanValidation.travelPlanCreate),
  TravelPlanController.createTravelPlan,
);

// get single travel plan
router.get("/details/:planId", TravelPlanController.getSingleTravelPlan);

// get my all travel plans
router.get("/me", auth("user"), TravelPlanController.getMyAllTravelPlans);

// update travel plan
router.patch(
  "/:planId",
  auth("user"),
  validateRequestData(TravelPlanValidation.updateTravelPlan),
  TravelPlanController.updateTravelPlan,
);

// close a travel paln
router.patch(
  "/:planId/close",
  auth("user"),
  TravelPlanController.closeTravelPlan,
);

// delete a travel plan
router.delete("/:planId", auth("user"), TravelPlanController.deleteTravelPlan);

// all travel plans
router.get("/", TravelPlanController.getAllTravelPlansFiltered);

export const TravelPlanRoutes = router;
