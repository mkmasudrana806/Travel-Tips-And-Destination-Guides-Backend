import mongoose from "mongoose";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import Post from "../post/post.model";
import { TStatusVote, VoteType } from "./postVote.interface";
import PostVote from "./postVote.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

/**
 * ------------ vote to a post (upvote/downvote) -----------------
 * one person can only one vote. existing vote update. new vote created
 *
 * @param post post to vote (up/down)
 * @param user who want to vote
 * @param newVoteType vote type (upvote/downvote)
 * @returns a message of new/existing vote
 */

const toggleVote = async (
  user: string,
  post: string,
  newVoteType: VoteType,
) => {
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
    }
    // commit the transaction
    await session.commitTransaction();
    return "vote successfull";
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to vote");
  }
};

/**
 * ------------- all voters lists with user info of a post ----------------
 * based on a post, return all voter info
 *
 * @param postId postId to return total votes
 * @param query limit and page for paginate
 * @returns aggregated user list with name and profile picture
 */
const postVoterLists = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  const votesBuild = new QueryBuilder(
    PostVote.find({ post: postId }).populate("user", "name profilePicture"),
    query,
  ).paginate();

  const result = await votesBuild.modelQuery;
  return result;
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

/**
 * ------------- my vote status of a post ----------------
 * check my status to a post that i vote or not
 *
 * @param postId id of the post, want to check vote status with an user
 * @param userId user who vote or not a post
 * @returns // { "hasVoted": true, "type": "upvote" | "downvote" | null }
 */
const myVoteStatus = async (post: string, user: string) => {
  const result = await PostVote.findOne({ post, user });

  let status: TStatusVote = { hasVoted: false, type: null };
  if (result) {
    status.hasVoted = true;
    status.type = result.type;
  }

  return status;
};

export const PostVoteServices = {
  toggleVote,
  postVoterLists,
  listOfPostsIVote,
  myVoteStatus,
};
