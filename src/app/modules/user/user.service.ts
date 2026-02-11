import { JwtPayload } from "jsonwebtoken";
import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { allowedFieldsToUpdate, searchableFields } from "./user.constant";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TfileUpload } from "../../interface/fileUploadType";
import config from "../../config";
import sendImageToCloudinary from "../../utils/sendImageToCloudinary";
import { TPayment } from "../payments/payment.interface";
import { Payment } from "../payments/payment.model";
import { initiatePayment } from "../payments/payment.utils";
import { Date } from "mongoose";
import Post from "../post/post.model";

/**
 * ----------------------- Create an user----------------------
 * @param file image file to upload (optional)
 * @param payload new user data
 * @returns return newly created user
 */
const createAnUserIntoDB = async (file: TfileUpload, payload: TUser) => {
  // set default password if password is not provided
  payload.password = payload.password || (config.default_password as string);

  // check if the user already exists
  const user = await User.findOne({ email: payload.email });
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  // set profilePicture if image is provided
  if (file) {
    const imageName = `${payload.email}-${payload.name}`;
    const path = file.path;
    const uploadedImage: any = await sendImageToCloudinary(path, imageName);
    if (!uploadedImage)
      throw new AppError(httpStatus.BAD_REQUEST, "Image is not uploaded");
    payload.profilePicture = uploadedImage.secure_url;
  }
  // set placeholder image if image is not provided
  else {
    payload.profilePicture =
      "";
  }

  const result = await User.create(payload);
  return result;
};

/**
 * ----------------------- update profile picture ----------------------
 * @param user currently logged in user jwt payload
 * @param file image file to upload
 * @returns return newly created user
 */
const updateProfilePictureIntoDB = async (
  currentUser: JwtPayload,
  file: TfileUpload,
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file attachement");
  }
  // set profilePicture if image is provided
  if (file) {
    const imageName = `${currentUser.email}`;
    const path = file.path;
    const uploadedImage: any = await sendImageToCloudinary(path, imageName);
    if (!uploadedImage) {
      throw new AppError(httpStatus.BAD_REQUEST, "Image is not uploaded");
    }
    // update to database
    await User.findByIdAndUpdate(currentUser.userId, {
      profilePicture: uploadedImage.secure_url,
    });

    return "Profile photo uploaded successfull";
  }
};

/**
 * ----------------------- get all users ----------------------
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
 * @param email email address
 * @param role user role
 * @returns own user data based on jwt payload data
 */
const getMe = async (user: JwtPayload) => {
  const result = await User.findOne({
    _id: user?.userId,
    role: user?.role,
    isDeleted: false,
  });

  console.log("user : ", result);
  return result;
};

/**
 * ----------------- get single user -----------------
 * @param id mongoose id of the user
 * return a user data
 */
const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

/**
 * --------------- delete an user form db ----------------
 * @param id user id
 * @returns return deleted user data
 */
const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result ? true : false;
};

/**
 * --------------- update an user form db ----------------
 * @param id user id
 * @param payload update user data
 * @featurs admin can change own and user data. user can change own data only
 * @returns return updated user data
 */
const updateUserIntoDB = async (
  currentUser: JwtPayload,
  payload: Partial<TUser>,
) => {
  // filter allowed fileds only
  const allowedFieldData = makeAllowedFieldData<TUser>(
    allowedFieldsToUpdate,
    payload,
  );

  const result = await User.findByIdAndUpdate(
    currentUser?.userId,
    allowedFieldData,
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

/**
 * -------------------- change user status ----------------------
 * @param id user id
 * @param payload user status payload
 * @validatios check if the user exists,not deleted. only admin can change user status
 * @validations main admin can't change own status
 * @returns return updated user status
 */
const changeUserStatusIntoDB = async (
  id: string,
  payload: { status: string },
) => {
  // check if user exists, not deleted
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User is already deleted!");
  }
  // check the user is not main admin
  if (user.email === "admin@gmail.com") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are main admin, can't change your status",
    );
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

/**
 * -------------------- change user role ----------------------
 * @param id user id
 * @param payload user role payload
 * @validatios check if the user exists,not deleted. only admin can change user role
 * @note admin can not change own role. admin can change only user role
 *  @validations main admin can't change own status
 * @returns return updated user data
 */
const changeUserRoleIntoDB = async (id: string, payload: { role: string }) => {
  // check if user exists, not deleted. find user that has role as user
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User is already deleted!");
  }

  // check the user is not main admin
  if (user.email === "admin@gmail.com") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are main admin, can't change role!",
    );
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

/**
 * -------------------- make user verified ----------------------
 * @param user user jwt payload
 * @param payload boolean payload
 */
const makeUserVerifiedIntoDB = async (user: JwtPayload, payload: TPayment) => {
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
    userId: user?.userId,
    username: user?.name,
    email: user?.email,
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
  user: JwtPayload,
  payload: TPayment,
) => {
  // payment data
  const tnxId = `tnx-${Date.now()}`;
  const paymentData: Partial<TPayment> = {
    userId: user?.userId,
    username: user?.name,
    email: user?.email,
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

/**
 *------------------ follow unfollow into DB ----------------
 *
 * @param currentUser current logged in user
 * @param targetUserId target user id to follow or unfollow
 * @returns return message of follow or unfollow
 */
const followUnfollowIntoDB = async (
  currentUser: JwtPayload,
  targetUserId: string,
) => {
  // Check if the target user exists in the database
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Target user not found!");
  }

  // check if already following
  const isAlreadyFollowing = targetUser.followers?.includes(currentUser.userId);

  if (isAlreadyFollowing) {
    // Unfollow: Remove current user from target user's followers list and
    // remove target user from current user's following list
    await User.updateOne(
      { _id: targetUserId },
      { $pull: { followers: currentUser.userId } },
    );
    await User.updateOne(
      { _id: currentUser.userId },
      { $pull: { following: targetUserId } },
    );

    return false;
  } else {
    // Follow: Add current user to target user's followers list and
    // add target user to current user's following list
    await User.updateOne(
      { _id: targetUserId },
      { $addToSet: { followers: currentUser.userId } },
    );
    await User.updateOne(
      { _id: currentUser.userId },
      { $addToSet: { following: targetUserId } },
    );

    return true;
  }
};

// ------------------ follow unfollow into DB ----------------
/**
 *
 * @param currentUser current logged in user
 * @param targetUserId target user id to follow or unfollow
 * @returns return message of follow or unfollow
 */
const checkFollowStatusIntoDB = async (
  user: JwtPayload,
  targetUserId: string,
) => {
  const currentUser = await User.findById(user?.userId);
  if (!currentUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  const isFollowing = currentUser.following?.includes(targetUserId);
  return isFollowing;
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
  followUnfollowIntoDB,
  checkFollowStatusIntoDB,
  getUserFlowersUnflollowersFromDB,
};
