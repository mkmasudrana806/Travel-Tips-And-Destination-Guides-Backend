import httpStatus from "http-status";
import { UserServices } from "./user.service";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";

// ------------------- create an user -------------------
const createAnUser = asyncHanlder(async (req, res) => {
  const payload = req.body;
  const result = await UserServices.createAnUser(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

// ------------------- update profile picture -------------------
const updateProfilePicture = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const file = req.body;
  const result = await UserServices.updateProfilePicture(userId, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile picture updated successfully",
    data: result,
  });
});

// ------------------- get all users -------------------
const getAllUsers = asyncHanlder(async (req, res) => {
  const { meta, result } = await UserServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully",
    meta: meta,
    data: result,
  });
});

// ------------------- get my profile -------------------
const getMe = asyncHanlder(async (req, res) => {
  const result = await UserServices.getMe(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is retrieved successfully",
    data: result,
  });
});

// ------------------- get a user profile -------------------
const getSingleUser = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const result = await UserServices.getSingleUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is retrieved successfully",
    data: result,
  });
});

// ------------------- delete an user -------------------
const deleteUser = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const result = await UserServices.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is deleted successfully",
    data: result,
  });
});

// ------------------- update an user -------------------
const updateUser = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await UserServices.updateUser(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is updated successfully",
    data: result,
  });
});

// ------------------- change user status -------------------
const changeUserStatus = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const payload = req.body;
  const result = await UserServices.changeUserStatus(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status is changed successfull",
    data: result,
  });
});

// ------------------- change user role -------------------
const changeUserRole = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const payload = req.body;
  const result = await UserServices.changeUserRole(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role  changed successfully",
    data: result,
  });
});

// ------------------- make user verified -------------------
const getVerified = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserServices.getVerified(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verified status is changed successfull",
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
  getVerified,
};
