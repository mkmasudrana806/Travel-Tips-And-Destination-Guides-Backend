import mongoose, { PipelineStage } from "mongoose";
import UserFollow from "./userFollow.model";
import { User } from "../user/user.model";

/**
 * ---------- get profile suggestion/recommendation ----------
 *
 * for logged in user (old user): who follows many users.
 * so based on it, recommend new profile
 * works: A follow X. X follow Y. so suggestion will shows Y except X already follows.
 * @param userId user who will get others profile suggestion
 * @param page 1st page by defualt
 * @param limit limits to 10 by default
 * @returns lists of users profile
 */
export const getFollowSuggestions = async (
  userId: string,
  page = 1,
  limit = 10,
) => {
  const myId = new mongoose.Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  const pipeline: PipelineStage[] = [
    // get people I follow
    {
      $match: { follower: myId },
    },

    // lookup who they (whom i follow) follow
    {
      $lookup: {
        from: "userfollows",
        localField: "following",
        foreignField: "follower",
        as: "secondDegree",
      },
    },

    { $unwind: "$secondDegree" },

    // exclude myself
    {
      $match: {
        "secondDegree.following": { $ne: myId },
      },
    },

    // group by suggested user
    {
      $group: {
        _id: "$secondDegree.following",
        mutualCount: { $sum: 1 },
      },
    },

    // exclude users I already follow
    {
      $lookup: {
        from: "userfollows",
        let: { suggestedUser: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$follower", myId] },
                  { $eq: ["$following", "$$suggestedUser"] },
                ],
              },
            },
          },
        ],
        as: "alreadyFollowing",
      },
    },

    {
      $match: {
        "alreadyFollowing.0": { $exists: false },
      },
    },

    // sort by mutual count
    {
      $sort: { mutualCount: -1 },
    },

    // apply pagination
    {
      $facet: {
        meta: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },

          // now join user profile info
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "profile",
            },
          },
          { $unwind: "$profile" },

          {
            $project: {
              _id: "$profile._id",
              name: "$profile.name",
              profilePicture: "$profile.profilePicture",
              mutualCount: 1,
            },
          },
        ],
      },
    },

    // Step 9: Clean response shape
    {
      $project: {
        meta: {
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        },
        data: 1,
      },
    },
  ];

  const result = await UserFollow.aggregate(pipeline);

  const response = result[0] || { meta: { total: 0 }, data: [] };

  return {
    meta: {
      total: response.meta.total,
      page,
      limit,
    },
    data: response.data,
  };
};


/**
 * ------------ profile suggestion for public user -----------
 * user is not logged in. so no personalized suggestion
 *
 * @param page by default 1
 * @param limit by default 10
 * @returns lists of profile based on followers count
 */
export const getPublicSuggestions = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .sort({ followerCount: -1 })
    .skip(skip)
    .limit(limit)
    .select("name profilePicture followerCount");

  const total = await User.countDocuments();

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: users,
  };
};
