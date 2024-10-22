import express from "express";
import { InsightController } from "./insights.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// get user insights
router.get("/user-insights", auth("user"), InsightController.getUserInsights);

// get admin insights
router.get(
  "/admin-insights",
  auth("admin"),
  InsightController.getAdminInsights
);


// get monthly overview for charts
router.get("/monthly-overview", auth("admin"), InsightController.getMonthlyOverview);

export const InsightsRoutes = router;
