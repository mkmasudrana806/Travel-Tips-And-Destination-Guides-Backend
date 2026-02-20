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

// all travel plans
router.get("/", TravelPlanController.getAllTravelPlansFiltered);

// get my all travel plans
router.get("/me", auth("user"), TravelPlanController.getMyAllTravelPlans);

// get single travel plan
router.get("/:planId", TravelPlanController.getSingleTravelPlan);

// update travel plan
router.patch(
  "/:planId",
  auth("user"),
  validateRequestData(TravelPlanValidation.updateTravelPlan),
  TravelPlanController.updateTravelPlan,
);


// delete a travel plan
router.delete("/:planId", auth("user"), TravelPlanController.deleteTravelPlan);

export const TravelPlanRoutes = router;
