import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/upload";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
const router = express.Router();

// create an user
router.post(
  "/create-user",
  // TODO: add file upload in client while register new user
  // upload.single("file"), // file uploading
  // (req: Request, res: Response, next: NextFunction) => {
  //   if (req.body?.data) {
  //     req.body = JSON.parse(req.body?.data);
  //     next();
  //   } else {
  //     throw new AppError(httpStatus.BAD_REQUEST, "Please provide user data");
  //   }
  // },
  validateRequestData(UserValidations.createUserValidationsSchema),
  UserControllers.createAnUser
);

// get all users
router.get("/", UserControllers.getAllUsers);

// get me route
router.get("/getMe", auth("user", "admin"), UserControllers.getMe);

// delete an user
router.delete("/", auth("user"), UserControllers.deleteUser);

// update an user
router.patch(
  "/update-profile",
  auth("user"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateUser
);

// update user profile picture
router.patch(
  "/update-profile-picture",
  upload.single("file"),
  auth("user"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateProfilePicture
);

// change user status
router.patch(
  "/toggle-user-status/:id",
  auth("admin"),
  validateRequestData(UserValidations.changeUserStatusSchema),
  UserControllers.changeUserStatus
);

// change user role
router.patch(
  "/toggle-user-role/:id",
  auth("admin"),
  validateRequestData(UserValidations.changeUserRoleSchema),
  UserControllers.changeUserRole
);

// make user verified
router.patch(
  "/make-user-verified",
  auth("user"),
  validateRequestData(UserValidations.makeUserVerifiedSchema),
  UserControllers.makeUserVerified
);

// give user premium access
router.patch(
  "/give-premium-access",
  auth("user"),
  validateRequestData(UserValidations.makeUserPremiumAccessSchema),
  UserControllers.makeUserPremiumAccess
);

// follow unfollow user
router.patch(
  "/follow-unfollow/:targetUserId",
  auth("user"),
  UserControllers.followUnfollow
);

// check follow status
router.get(
  "/follow-status/:targetUserId",
  auth("user"),
  UserControllers.checkFollowStatus
);

export const UserRoutes = router;
