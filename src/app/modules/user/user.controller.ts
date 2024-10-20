import httpStatus from "http-status";
import { UserServices } from "./user.service";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { TfileUpload } from "../../interface/fileUploadType";

// ------------------- create an user -------------------
const createAnUser = asyncHanlder(async (req, res) => {
  const result = await UserServices.createAnUserIntoDB(
    req.file as TfileUpload,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

// ------------------- update profile picture -------------------
const updateProfilePicture = asyncHanlder(async (req, res) => {
  const result = await UserServices.updateProfilePictureIntoDB(
    req.user,
    req.file as TfileUpload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile picture updated successfully",
    data: result,
  });
});

// ------------------- get all users -------------------
const getAllUsers = asyncHanlder(async (req, res) => {
  const { meta, result } = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully",
    meta: meta,
    data: result,
  });
});

// ------------------- get me -------------------
const getMe = asyncHanlder(async (req, res) => {
  const { email, role } = req.user;
  const result = await UserServices.getMe(email, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is retrieved successfully",
    data: result,
  });
});

// ------------------- get me -------------------
const getSingleUser = asyncHanlder(async (req, res) => {
  const result = await UserServices.getSingleUserFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is retrieved successfully",
    data: result,
  });
});

// ------------------- delete an user -------------------
const deleteUser = asyncHanlder(async (req, res) => {
  const result = await UserServices.deleteUserFromDB(req.user?.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is deleted successfully",
    data: result,
  });
});

// ------------------- update an user -------------------
const updateUser = asyncHanlder(async (req, res) => {
  const result = await UserServices.updateUserIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is updated successfully",
    data: result,
  });
});

// ------------------- change user status -------------------
const changeUserStatus = asyncHanlder(async (req, res) => {
  const result = await UserServices.changeUserStatusIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status is changed successfull",
    data: result,
  });
});

// ------------------- change user role -------------------
const changeUserRole = asyncHanlder(async (req, res) => {
  const result = await UserServices.changeUserRoleIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role  changed successfully",
    data: result,
  });
});

// ------------------- make user verified -------------------
const makeUserVerified = asyncHanlder(async (req, res) => {
  const result = await UserServices.makeUserVerifiedIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verified status is changed successfull",
    data: result,
  });
});

// ------------------- make user premium access -------------------
const makeUserPremiumAccess = asyncHanlder(async (req, res) => {
  const result = await UserServices.makeUserPremiumAccessIntoDB(
    req.user,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "amarPay session is initiated successfully",
    data: result,
  });
});

// ------------------- follow or unfollow -------------------
const followUnfollow = asyncHanlder(async (req, res) => {
  const result = await UserServices.followUnfollowIntoDB(
    req.user,
    req.params.targetUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result ? "Following successfull" : "Unfollowing successfull",
    data: result,
  });
});

// ------------------- check follow status -------------------
const checkFollowStatus = asyncHanlder(async (req, res) => {
  const result = await UserServices.checkFollowStatusIntoDB(
    req.user,
    req.params.targetUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result
      ? "You are following this user"
      : "You are not following this user",
    data: result,
  });
});

// ------------------- check follow status -------------------
const getUserFlowersUnflollowers = asyncHanlder(async (req, res) => {
  const result = await UserServices.getUserFlowersUnflollowersFromDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Followers and Following Lists Retrieved Successfull",
    data: result,
  });
});

export const UserControllers = {
  createAnUser,
  updateProfilePicture,
  getAllUsers,
  getMe,
  getSingleUser,
  deleteUser,
  updateUser,
  changeUserStatus,
  changeUserRole,
  makeUserVerified,
  makeUserPremiumAccess,
  followUnfollow,
  checkFollowStatus,
  getUserFlowersUnflollowers,
};
