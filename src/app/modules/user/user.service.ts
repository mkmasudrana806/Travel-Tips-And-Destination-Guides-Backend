import {  searchableFields } from "./user.constant";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TfileUpload } from "../../interface/fileUploadType";
import { TJwtPayload } from "../../interface/JwtPayload";
import Post from "../post/post.model";

/**
 * ----------------------- Create an user----------------------
 *
 * @param payload new user data
 * @returns return newly created user
 */
const createAnUser = async (payload: TUser) => {
  // check if the user already exists
  const user = await User.findOne({ email: payload.email });
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }
  const result = await User.create(payload);
  return result;
};

/**
 * ----------------------- update profile picture ----------------------
 *
 * @param user currently logged in user jwt payload
 * @param file image file to upload
 * @returns return newly created user
 */
const updateProfilePicture = async (
  userId: string,
  file: TfileUpload,
) => {
  // update to database
  const result = await User.findByIdAndUpdate(userId, {
    profilePicture: file.path,
  });

  return result;
};

/**
 * ----------------------- get all users ----------------------
 *
 * @return return all users
 */
const getAllUsers = async (query: Record<string, any>) => {
  const userQuery = new QueryBuilder(User.find({ isDeleted: false }), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fieldsLimiting();
  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;
  return { meta, result };
};

/**
 * -----------------  get me  -----------------
 *
 * @param email email address
 * @param role user role
 * @returns own user data based on jwt payload data
 */
const getMe = async (user: TJwtPayload) => {
  const result = await User.findOne({
    _id: user.userId,
    role: user.role,
    isDeleted: false,
  });
  return result;
};

/**
 * ----------------- get single user -----------------
 *
 * @param id mongoose id of the user
 * return a user data
 */
const getSingleUser = async (userId: string) => {
  const result = await User.findOne({
    _id: userId,
    isDeleted: false,
    status: "active",
  });
  return result;
};

/**
 * --------------- delete an user form db ----------------
 *
 * @param userId userId to delete
 * @returns return deleted user data
 */
const deleteUser = async (userId: string) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  );
  return result ? true : false;
};

/**
 * --------------- update an user form db ----------------
 *
 * @param userId user id
 * @param payload updated user data
 * @featurs admin can change own and user data. user can change own data only
 * @returns return updated user data
 */
const updateUser = async (userId: string, payload: Partial<TUser>) => {
  const result = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

/**
 * -------------------- change user status ----------------------
 *
 * @param userId userId need to change his status (user-> admin or vice versa)
 * @param payload user status payload
 * @validatios check if the user exists,not deleted. only admin can change user status
 * @validations main admin can't change own status
 * @returns return updated user status
 */
const changeUserStatus = async (
  userId: string,
  payload: { status: string },
) => {
  // check if user exists, not deleted or blocked
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User is already deleted!");
  }
  if (user.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "User is already blocked!");
  }

  // check the user is not main admin. others admin except this email can change their status
  // the main admin can change others admin status. as only main admin belong to this email
  if (user.email === "admin@gmail.com" && user.role === "admin") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't change main admin status",
    );
  }

  const result = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

/**
 * -------------------- change user role ----------------------
 *
 * @param userId userId to change his role (user -> admin or vice versa)
 * @param payload user new role
 * @note admin can not change own role. admin can change only user role
 * @returns return updated user data
 */
const changeUserRole = async (
  userId: string,
  payload: { role: string },
) => {
  // check if user exists, not deleted. find user that has role as user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User is already deleted!");
  }
  if (user.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "User is already blocked!");
  }
  // check the user is not main admin. main admin can change others admin/users role.
  if (user.email === "admin@gmail.com" && user.role === "admin") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't change main admin role!",
    );
  }

  await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return "User role is changed";
};

/**
 * -------------------- get verified ----------------------
 *
 * If users aquired more than 5000 followers and
 * any post has more than 100 upvotes, they can apply for verification badge
 *
 * @param userId userId of the user, who want to get verified
 * @param payload boolean payload
 */
const getVerified = async (
  userId: string,
  payload: { isVerified: boolean },
) => {
  const user = await User.findById(userId).select("name email followerCount");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // check if user has more than 5000 followers
  if (user.followerCount < 5000) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not eligible for verification. you should meet 5000 followers",
    );
  }

  // check if user has any post more than 100 votes
  const postfound = await Post.findOne({
    author: userId,
    upvoteCount: {
      $gt: 100,
    },
    isDeleted: false,
  });

  if (!postfound) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not eligible for verification. you should have at least 100 up votes in any post",
    );
  }

  // update verification flag
  const result = await User.findByIdAndUpdate(userId, payload);
  return result;
};


export const UserServices = {
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
