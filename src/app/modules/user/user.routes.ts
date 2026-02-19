import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middlewares/auth";
import { PaymentValidations } from "../payments/payment.validation";
import { CloudinaryMulterUpload } from "../../config/multer.config";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { MediaValidationSchema } from "../media/media.validation";
const router = express.Router();

// create an user
router.post(
  "/",
  validateRequestData(UserValidations.createUserValidationsSchema),
  UserControllers.createAnUser,
);

// get all users
router.get("/", auth("admin"), UserControllers.getAllUsers);

// get my profile
router.get("/me", auth("user"), UserControllers.getMe);

// get a user profile
router.get("/:userId", UserControllers.getSingleUser);

// delete an user account
router.delete("/:userId", auth("admin"), UserControllers.deleteUser);

// update my profile
router.put(
  "/",
  auth("user"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateUser,
);

// change an user status
router.patch(
  "/:userId/status",
  auth("admin"),
  validateRequestData(UserValidations.changeUserStatusSchema),
  UserControllers.changeUserStatus,
);

// change an user role
router.patch(
  "/:userId/role",
  auth("admin"),
  validateRequestData(UserValidations.changeUserRoleSchema),
  UserControllers.changeUserRole,
);

// make an user verified
router.post(
  "/user-verified",
  auth("user"),
  validateRequestData(PaymentValidations.paymentValidationSchema),
  UserControllers.makeUserVerified,
);

// give an user premium access
router.post(
  "/premium-access",
  auth("user"),
  validateRequestData(PaymentValidations.paymentValidationSchema),
  UserControllers.makeUserPremiumAccess,
);

export const UserRoutes = router;
