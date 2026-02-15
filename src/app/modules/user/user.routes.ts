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
  "/create-user",
  validateRequestData(UserValidations.createUserValidationsSchema),
  UserControllers.createAnUser,
);

// get all users
router.get("/", auth("admin"), UserControllers.getAllUsers);

// get my profile
router.get("/getMe", auth("user", "admin"), UserControllers.getMe);

// get a user profile
router.get("/:id", UserControllers.getSingleUser);

// delete an user account
router.delete("/:id", auth("admin"), UserControllers.deleteUser);

// update my profile
router.patch(
  "/update-profile",
  auth("user", "admin"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateUser,
);

// update my profile picture
router.patch(
  "/update-profile-picture",
  auth("user"),
  CloudinaryMulterUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      req.body = req.file;
      validateRequestData(MediaValidationSchema);
      next();
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to upload file!");
    }
  },
  UserControllers.updateProfilePicture,
);

// change an user status
router.patch(
  "/toggle-user-status/:id",
  auth("admin"),
  validateRequestData(UserValidations.changeUserStatusSchema),
  UserControllers.changeUserStatus,
);

// change an user role
router.patch(
  "/toggle-user-role/:id",
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
