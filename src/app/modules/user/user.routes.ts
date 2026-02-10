import express from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/upload";
import { PaymentValidations } from "../payments/payment.validation";
import { CloudinaryMulterUpload } from "../../config/multer.config";
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
router.get("/", auth("admin"), UserControllers.getAllUsers);

// get me route
router.get("/getMe", auth("user", "admin"), UserControllers.getMe);

// get single user
router.get("/:id", UserControllers.getSingleUser);

// delete an user
router.delete("/:id", auth("admin"), UserControllers.deleteUser);

// update an user
router.patch(
  "/update-profile",
  auth("user", "admin"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateUser
);

// update user profile picture
router.patch(
  "/update-profile-picture",
  // upload.single("file"),
  CloudinaryMulterUpload.single("file"),
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
router.post(
  "/user-verified",
  auth("user"),
  validateRequestData(PaymentValidations.paymentValidationSchema),
  UserControllers.makeUserVerified
);

// give user premium access
router.post(
  "/premium-access",
  auth("user"),
  validateRequestData(PaymentValidations.paymentValidationSchema),
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

// get user followers and following lists
router.post(
  "/followers-followings",
  UserControllers.getUserFlowersUnflollowers
);

export const UserRoutes = router;
