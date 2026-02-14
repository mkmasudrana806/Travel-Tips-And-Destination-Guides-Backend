import mongoose from "mongoose";
import { User } from "../user/user.model";
import UserFollow from "./userFollow.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";

/**
 * ------------- follow/unfollow an user ----------------
 *
 * who follow whom. who (follower) -> whom (following)
 *
 * @param currentUser who want to follow 'targetUser'
 * @param targetUser whom currentUser will follow
 * @returns newly created UserFollow data
 */
const toggleFollow = async (currentUser: string, targetUser: string) => {
  if (targetUser === currentUser) throw new Error("You cannot follow yourself");

  let result: boolean;
  console.log(targetUser, currentUser);
  // start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // check if already following
    const existingFollow = await UserFollow.findOne({
      follower: currentUser,
      following: targetUser,
    }).session(session);

    if (existingFollow) {
      // as exist, delete follow data
      await existingFollow.deleteOne().session(session);

      // dec by 1 following count in user profile
      await User.findByIdAndUpdate(
        currentUser,
        {
          $inc: { followingCount: -1 },
        },
        { session },
      );

      // dec follower count by 1 in the target user
      await User.findByIdAndUpdate(
        targetUser,
        { $inc: { followerCount: -1 } },
        { session },
      );
      result = false;
    } else {
      // as no follow data. so we create new userFollow record
      await UserFollow.create(
        [
          {
            follower: currentUser,
            following: targetUser,
          },
        ],
        { session },
      );

      // current user now followingCount by 1
      await User.findByIdAndUpdate(
        currentUser,
        {
          $inc: { followingCount: 1 },
        },
        { session },
      );

      // targetUer get 1 follower. so update by 1
      await User.findByIdAndUpdate(
        targetUser,
        { $inc: { followerCount: 1 } },
        { session },
      );
      result = true;
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to follow");
  }
};

/**
 * ------------ get followers lists of an user -----------------
 *
 * @param userId userId, who want to get all his followers
 * @param query pagination
 * @returns meta and result
 */
const getFollowers = async (userId: string, query: Record<string, unknown>) => {
  const followersQuery = new QueryBuilder(
    UserFollow.find({ following: userId }).populate(
      "follower",
      "name profilePicture",
    ),
    query,
  )
    .paginate()
    .sort();

  const meta = await followersQuery.countTotal();
  const result = await followersQuery.modelQuery;
  return {
    meta,
    result,
  };
};

export const UserFollowService = {
  toggleFollow,
  getFollowers,
};
