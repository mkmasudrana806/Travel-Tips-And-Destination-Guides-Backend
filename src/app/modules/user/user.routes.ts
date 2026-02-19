import express from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middlewares/auth";
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

// get verified profile
router.patch(
  "/verification",
  auth("user"),
  validateRequestData(UserValidations.makeUserVerifiedSchema),
  UserControllers.getVerified,
);

export const UserRoutes = router;
