import express from "express";
import { PaymentControllers } from "./payment.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PaymentValidations } from "./payment.validation";
const router = express.Router();

// upgrade user to premium
router.post(
  "/upgrade-user",
  PaymentControllers.upgradeUserToPremium
);

// get all payments history
router.get("/", auth("admin"), PaymentControllers.allPaymentHistory);

// get user payments history
router.get(
  "/my-payments-history",
  auth("user"),
  PaymentControllers.userPaymentHistory
);

// update payment status
router.post(
  "/:id",
  auth("admin"),
  validateRequestData(PaymentValidations.updatePaymentStatusSchema),
  PaymentControllers.updatePaymentStatus
);

export const PaymentRoutes = router;
