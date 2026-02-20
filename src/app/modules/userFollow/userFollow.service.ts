import mongoose, { PipelineStage, Types } from "mongoose";
import { User } from "../user/user.model";
import UserFollow from "./userFollow.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import {
  getPersonalizedProfileSuggestions,
  getPublicProfileSuggestions,
} from "./userFollow.utils";
import { NotificationService } from "../notifications/notifications.service";
import { query } from "express";

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

      // create notification when follow
      await NotificationService.createNotification({
        recipient: new mongoose.Types.ObjectId(targetUser),
        sender: new mongoose.Types.ObjectId(currentUser),
        type: "new_follower",
        resourceType: "Post",
        resourceId: new mongoose.Types.ObjectId(currentUser),
      });
    }

    await session.commitTransaction();
    await session.endSession();
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
 * current user: who view target user profile. target user: whoes profile is being viewed
 *
 * @param viewerId who views an user profile (optional, if not logged in, then show empty list as mutual friend)
 * @param targetUserId whoes profile is being viewed
 * @returns the mutal friends lists and counts
 */
const getMutualFriends = async (viewerId: string, targetUserId: string) => {
  // if viewer is not logged in or viewer is the target user himself.
  // return empty list as mutual friend because mutual friend only exist between two different user.
  if (!viewerId || viewerId === targetUserId) return [];

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
    { $limit: 50 },
  ]);

  return mutuals;
};

/**
 * ------------ get profile suggestion with fallback (new user) ------------
 * it handle three cases: non logged-in, logged in but new user and old user who follow people.
 * case 1: if user is not logged in, then suggest public profile based on followers counts
 * case 2: new user and logged in, show public profile who's followers counts and newly user
 * case 3: old user, show recommended users based on mutual friends
 *
 * @param userId user to show profile recommendations
 * @param page by default 1
 * @param limit by default 10
 * @returns lists of recommended users profile
 */

const getProfileSuggestions = async (
  userId: string,
  query: Record<string, string>,
) => {
  let { page = 1, limit = 10 } = query;
  page = Number(page);
  limit = Number(limit);

  // public is not logged in, blocked, token not valid. means guest user
  if (!userId) {
    return getPublicProfileSuggestions(page, limit);
  }

  // personalized suggestion when user logged in.
  const suggestions = await getPersonalizedProfileSuggestions(
    userId,
    page,
    limit,
  );

  // for the logged in user. i will apply 3 cases logic to show profile suggestion.
  // as personalized suggestion is zero. so show public profile suggestion.
  if (suggestions.data.length === 0) {
    return getPublicProfileSuggestions(page, limit);
  }
  // as personalized not zero but less than limit. so return personalized + public profile suggestion as fallback to fill the gap.
  else if (suggestions.data.length > 0 && suggestions.data.length < limit) {
    const remainingLimit = limit - suggestions.data.length;
    const publicSuggestions = await getPublicProfileSuggestions(
      page,
      remainingLimit,
    );
    return {
      meta: {
        total: suggestions.meta.total + publicSuggestions.meta.total,
        page,
        limit,
      },
      data: [...suggestions.data, ...publicSuggestions.data],
    };
  }
  // as personalized not zero and more than limit. so return personalized profile suggestion
  else {
    return suggestions;
  }
};

export const UserFollowService = {
  toggleFollow,
  getFollowers,
  getFollowings,
  getMutualFriends,
  getProfileSuggestions,
};
