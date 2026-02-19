import express from "express";
import { PaymentControllers } from "./payment.controller";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { PaymentValidations } from "./payment.validation";
const router = express.Router();

// initiate payment session for premium subscription
router.post(
  "/",
  auth("user"),
  validateRequestData(PaymentValidations.getSubscriptionSchema),
  PaymentControllers.getSubscriptionSession,
);

// on payment status
router.post(
  "/success",
  validateRequestData(PaymentValidations.onPaymentSuccessSchema),
  PaymentControllers.onPaymentSuccess,
);

// on payment failed
// router.post("/failed", PaymentControllers.onPaymentFailed);

router.post("/user-verified", PaymentControllers.upgradeUserToVerified);

// get all payments history
router.get("/", auth("admin"), PaymentControllers.allPaymentHistory);

// get user payments history
router.get(
  "/my-payments-history",
  auth("user"),
  PaymentControllers.userPaymentHistory,
);

// update payment status
router.post(
  "/:id",
  auth("admin"),
  validateRequestData(PaymentValidations.updatePaymentStatusSchema),
  PaymentControllers.updatePaymentStatus,
);

export const PaymentRoutes = router;
