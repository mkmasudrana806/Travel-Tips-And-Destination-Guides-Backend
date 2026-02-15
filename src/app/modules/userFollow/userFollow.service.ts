import mongoose, { PipelineStage, Types } from "mongoose";
import { User } from "../user/user.model";
import UserFollow from "./userFollow.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { getFollowSuggestions, getPublicSuggestions } from "./userFollow.utils";

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

/**
 * ------------ get followings lists of an user -----------------
 *
 * @param userId userId, who want to get all his followings
 * @param query pagination
 * @returns meta and result
 */
const getFollowings = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const followingsQuery = new QueryBuilder(
    UserFollow.find({ follower: userId }).populate(
      "following",
      "name profilePicture",
    ),
    query,
  )
    .paginate()
    .sort();

  const meta = await followingsQuery.countTotal();
  const result = await followingsQuery.modelQuery;
  return {
    meta,
    result,
  };
};

/**
 * ------------ get mutual connection between two user -----------
 * user A: who views user B profile. now show mutual friends between them.
 * means both A and B followed by common users.
 *
 * @param viewerId who views a user profile
 * @param targetUserId the id of the user, who profiled will be viewed
 * @returns the mutal friends lists and counts
 */
const getMutualFriends = async (viewerId: string, targetUserId: string) => {
  const viewerObjectId = new Types.ObjectId(viewerId);
  const targetObjectId = new Types.ObjectId(targetUserId);

  const mutuals = await UserFollow.aggregate([
    {
      $match: { follower: viewerObjectId },
    },
    {
      $project: { following: 1 },
    },
    {
      $lookup: {
        from: "userfollows",
        let: { followed_by_me: "$following" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$follower", "$$followed_by_me"] },
                  { $eq: ["$following", targetObjectId] },
                ],
              },
            },
          },
        ],
        as: "relationship",
      },
    },
    {
      $match: { "relationship.0": { $exists: true } },
    },
    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "userProfile",
      },
    },
    { $unwind: "$userProfile" },
    {
      $project: {
        _id: "$userProfile._id",
        name: "$userProfile.name",
        profilePicture: "$userProfile.profilePicture",
      },
    },
    { $limit: 5 },
  ]);

  return mutuals;
};

/**
 * ------------ get follow suggestion with fallback for new user ------------
 * it handle three cases: non logged-in, logged in but new user and old user who follow people.
 * case 1: if user is not logged in, then suggest public profile based on followers counts
 * case 2: new user and logged in, show public profile who's followers counts and newly user
 * case 3: old user, show recommended users based on mutual friends
 *
 * @param userId user to show follow recommendation
 * @param page by default 1
 * @param limit by default 10
 * @returns lists of recommended profile
 */

const getFollowSuggestionsWithFallback = async (
  userId = null,
  page = 1,
  limit = 10,
) => {
  // public is not logged in, blocked, token not valid. means guest user
  if (!userId) {
    return getPublicSuggestions(page, limit);
  }

  // personalized suggestion when user logged in.
  const suggestions = await getFollowSuggestions(userId, page, limit);
  if (suggestions.data.length > 0) {
    return suggestions;
  }

  console.log("suggestion: ", suggestions);

  // if personalized suggestion not found, then return some users as fallback
  return getPublicSuggestions(page, limit);
};

export const UserFollowService = {
  toggleFollow,
  getFollowers,
  getFollowings,
  getMutualFriends,
  getFollowSuggestionsWithFallback,
};
