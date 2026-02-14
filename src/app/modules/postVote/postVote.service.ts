import Post from "../post/post.model";
import { VoteType } from "./postVote.interface";
import PostVote from "./postVote.model";

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
  const existingVote = await PostVote.findOne({ user, post });

  // case 1: check if user has already voted on this post
  if (existingVote) {
    const existingVoteType = existingVote.type;
    // if existing vote type and new vote type same. delete the vote
    if (existingVoteType === newVoteType) {
      await existingVote.deleteOne();
      const updateField =
        newVoteType === "upvote" ? { upvoteCount: -1 } : { downvoteCount: -1 };

      // decrement by 1 from vote count in Post document
      return await Post.findByIdAndUpdate(
        post,
        { $inc: updateField },
        { new: true },
      );
    }

    // case 2: user switch upvote -> downvote or vice versa
    // so new type assign to existing type
    existingVote.type = newVoteType;
    await existingVote.save();

    // if newVote upvote, count inc by 1 and downvote dec by 1
    const updateFields =
      newVoteType === VoteType.UPVOTE
        ? { upvoteCount: 1, downvoteCount: -1 }
        : { upvoteCount: -1, downvoteCount: 1 };

    return await Post.findByIdAndUpdate(
      post,
      { $inc: updateFields },
      { new: true },
    );
  }

  // case 3: new vote. so direct create vote and update counter in post
  await PostVote.create({ user, post, type: newVoteType });
  const updateField =
    newVoteType === VoteType.UPVOTE ? { upvoteCount: 1 } : { downvoteCount: 1 };
  return await Post.findByIdAndUpdate(
    post,
    { $inc: updateField },
    { new: true },
  );
};

export const PostVoteServices = {
  toggleVote,
};
