import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { allowedFieldsToUpdate, searchableFields } from "./user.constant";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TfileUpload } from "../../interface/fileUploadType";
import { TPayment } from "../payments/payment.interface";
import { Payment } from "../payments/payment.model";
import { initiatePayment } from "../payments/payment.utils";
import mongoose, { Date } from "mongoose";
import Post from "../post/post.model";
import { TJwtPayload } from "../../interface/JwtPayload";

/**
 * ----------------------- Create an user----------------------
 *
 * @param payload new user data
 * @returns return newly created user
 */
const createAnUserIntoDB = async (payload: TUser) => {
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
const updateProfilePictureIntoDB = async (
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
const getAllUsersFromDB = async (query: Record<string, any>) => {
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
const getSingleUserFromDB = async (userId: string) => {
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
const deleteUserFromDB = async (userId: string) => {
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
const updateUserIntoDB = async (userId: string, payload: Partial<TUser>) => {
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
const changeUserStatusIntoDB = async (
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
const changeUserRoleIntoDB = async (
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
 * -------------------- make user verified ----------------------
 * @param user user jwt payload
 * @param payload boolean payload
 */
const makeUserVerifiedIntoDB = async (user: TJwtPayload, payload: TPayment) => {
  // Find one post where the author is the user and upvotes array is non-empty
  const isPostFound = await Post.findOne({
    author: user?.userId,
    isDeleted: false,
    upvotes: { $exists: true, $not: { $size: 0 } },
  });

  // If a post with upvotes is found, set isUpvoteOk to true
  const isUpvoteOk = !!isPostFound;

  if (!isUpvoteOk) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one upvote required to verfied profile!",
    );
  }

  // payment data
  const tnxId = `tnx-${Date.now()}`;
  const paymentData: Partial<TPayment> = {
    userId: new mongoose.Types.ObjectId(user.userId),
    // username: user?.name,
    // email: user?.email,
    amount: payload.amount,
    subscriptionType: payload.subscriptionType,
    transactionId: tnxId,
  };

  // set subscription expires date
  const expiredDate = new Date();
  if (paymentData.subscriptionType === "monthly") {
    expiredDate.setDate(expiredDate.getDate() + 30);
  } else if (paymentData.subscriptionType === "yearly") {
    expiredDate.setDate(expiredDate.getDate() + 365);
  }
  paymentData.expiresIn = expiredDate as unknown as Date;

  //  save payment info to DB
  const result = await Payment.create(paymentData);
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Faild to create payment",
    );
  }

  const successUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/user-verified?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=success`;

  const faildUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/user-verified?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=failed`;

  //  initiate amarPay session and return session url
  const session = await initiatePayment(paymentData, successUrl, faildUrl);
  return session;
};

/**
 * -------------------- make User Premium Access ----------------------
 * @param user user jwt payload
 * @param payload boolean payload
 */
const makeUserPremiumAccessIntoDB = async (
  user: TJwtPayload,
  payload: TPayment,
) => {
  // payment data
  const tnxId = `tnx-${Date.now()}`;
  const paymentData: Partial<TPayment> = {
    userId: new mongoose.Types.ObjectId(user.userId),
    // username: user?.name,
    // email: user?.email,
    amount: payload.amount,
    subscriptionType: payload.subscriptionType,
    transactionId: tnxId,
  };

  // set subscription expires date
  const expiredDate = new Date();
  if (paymentData.subscriptionType === "monthly") {
    expiredDate.setDate(expiredDate.getDate() + 30);
  } else if (paymentData.subscriptionType === "yearly") {
    expiredDate.setDate(expiredDate.getDate() + 365);
  }
  paymentData.expiresIn = expiredDate as unknown as Date;

  //  save payment info to DB
  const result = await Payment.create(paymentData);
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Faild to create payment",
    );
  }

  const successUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=success`;

  const faildUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=failed`;

  //  initiate amarPay session and return session url
  const session = await initiatePayment(paymentData, successUrl, faildUrl);
  return session;
};

// -------------------- get user flowers and unfollowers --------------------
/**
 * @param followers followers array of user IDs
 * @param followings followings array of user IDs
 * @returns return followerLists and followingLists
 */
const getUserFlowersUnflollowersFromDB = async (payload: {
  followers: string[];
  followings: string[];
}) => {
  let followerLists;
  let followingLists;
  if (payload?.followers?.length > 0) {
    followerLists = await User.find({
      _id: { $in: payload?.followers },
    }).select("_id name email profilePicture");
  }

  if (payload?.followings) {
    followingLists = await User.find({
      _id: { $in: payload?.followings },
    }).select("_id name email profilePicture");
  }
  return { followerLists, followingLists };
};

export const UserServices = {
  createAnUserIntoDB,
  updateProfilePictureIntoDB,
  getAllUsersFromDB,
  getMe,
  getSingleUserFromDB,
  deleteUserFromDB,
  updateUserIntoDB,
  changeUserStatusIntoDB,
  changeUserRoleIntoDB,
  makeUserVerifiedIntoDB,
  makeUserPremiumAccessIntoDB,
  getUserFlowersUnflollowersFromDB,
};
