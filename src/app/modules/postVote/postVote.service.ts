import mongoose from "mongoose";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import Post from "../post/post.model";
import { VoteType } from "./postVote.interface";
import PostVote from "./postVote.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { NotificationService } from "../notifications/notifications.service";

/**
 * ------------ vote to a post (upvote/downvote) -----------------
 * Actions: upvote/downvote a post, remove existing vote, update existing vote
 * Rules:
 * one person can only one vote. existing vote update. new vote created
 * case 1: existing upvote and new upvote -> remove existing upvote or vice versa
 * case 2: existing upvote and new downvote -> update existing vote to downvote or vice versa
 * case 3: no existing vote and new upvote/downvote -> create new vote
 * case 4: if upvote, create notification to post author
 *
 * @param user who want to vote
 * @param post post to vote (up/down)
 * @param newVoteType vote type (upvote/downvote)
 * @returns a message of new/existing vote
 */

const toggleVote = async (
  user: string,
  post: string,
  newVoteType: VoteType,
) => {
  // returned data
  let voteState = {
    message: "",
    voteType: newVoteType,
  };

  const existingPost = await Post.findById(post);
  if (!existingPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found!");
  }

  // start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await PostVote.findOne({ user, post }).session(
      session,
    );
    // case 1: check if user has already voted on this post
    if (existingVote) {
      const existingVoteType = existingVote.type;
      // if existing vote type and new vote type same. delete the vote
      if (existingVoteType === newVoteType) {
        await existingVote.deleteOne({ session });
        const updateField =
          newVoteType === "upvote"
            ? { upvoteCount: -1 }
            : { downvoteCount: -1 };

        // decrement by 1 from vote count in Post document
        await Post.findByIdAndUpdate(
          post,
          { $inc: updateField },
          { new: true, session },
        );

        voteState.message = "Vote removed";
      } else {
        // case 2: user switch upvote -> downvote or vice versa
        // so new type assign to existing type
        existingVote.type = newVoteType;
        await existingVote.save({ session });

        // if newVote upvote, count inc by 1 and downvote dec by 1
        const updateFields =
          newVoteType === VoteType.UPVOTE
            ? { upvoteCount: 1, downvoteCount: -1 }
            : { upvoteCount: -1, downvoteCount: 1 };

        await Post.findByIdAndUpdate(
          post,
          { $inc: updateFields },
          { new: true, session },
        );

        voteState.message = "Vote updated";
      }

      // create notification if upvote
      if (newVoteType === VoteType.UPVOTE) {
        await NotificationService.createNotification({
          recipient: existingPost.author,
          sender: new mongoose.Types.ObjectId(user),
          type: "post_upvote",
          resourceType: "Post",
          resourceId: existingPost._id,
        });
      }
    } else {
      // case 3: new vote. so direct create vote and update counter in post
      await PostVote.create([{ user, post, type: newVoteType }], { session });
      const updateField =
        newVoteType === VoteType.UPVOTE
          ? { upvoteCount: 1 }
          : { downvoteCount: 1 };
      await Post.findByIdAndUpdate(
        post,
        { $inc: updateField },
        { new: true, session },
      );

      // create notification if upvote
      if (newVoteType === VoteType.UPVOTE) {
        await NotificationService.createNotification({
          recipient: existingPost.author,
          sender: new mongoose.Types.ObjectId(user),
          type: "post_upvote",
          resourceType: "Post",
          resourceId: existingPost._id,
        });
      }
    }

    voteState.message = voteState.message || "Vote added";
    // commit the transaction
    await session.commitTransaction();
    await session.endSession();
    return voteState;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to vote");
  }
};

/**
 * ------------- all voters lists with user info of a post ----------------
 *
 * based on postId, return all voters list with user info.
 * also filter with vote type (upvote/downvote) and paginate with limit and page
 *
 * @param postId postId to return total votes
 * @param query limit, page and type (upvote/downvote)
 * @returns aggregated user list with name and profile picture
 */
const postVoterLists = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  const { page = 1, limit = 10, type } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter: Record<string, VoteType> = {};

  if (type === "upvote") {
    filter.type = VoteType.UPVOTE;
  } else if (type === "downvote") {
    filter.type = VoteType.DOWNVOTE;
  }

  const data = await PostVote.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId), ...filter } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        "user._id": 1,
        "user.name": 1,
        "user.profilePicture": 1,
        type: 1,
      },
    },
    { $skip: skip },
    { $limit: Number(limit) },
    { $sort: { createdAt: -1 } },
  ]);

  const totalVotes = await PostVote.countDocuments({ post: postId, ...filter });
  return {
    data,
    meta: {
      page,
      limit,
      totalVotes,
    },
  };
};

/**
 * ------------- lists of posts, i vote ----------------
 * based on an user id, return lists of post, this user votes
 *
 * @param userId user, who votes lists of posts
 * @param query limit and page for paginate
 * @returns lists of posts, the user given vote
 */
const listOfPostsIVote = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const votesBuild = new QueryBuilder(
    PostVote.find({ user: userId }).populate("post"),
    query,
  ).paginate();

  const result = await votesBuild.modelQuery;
  return result;
};

export const PostVoteServices = {
  toggleVote,
  postVoterLists,
  listOfPostsIVote,
};
