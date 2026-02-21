import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import mongoose from "mongoose";
import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";

/**
 * -------------- create a comment into db --------------
 *
 * @param userId user who want to comment
 * @param payload payload for comment
 * @returns new comment data
 */
const createACommentIntoDB = async (userId: string, payload: TComment) => {
  const { content, parentComment, post } = payload;

  // check post exists or not
  const existsPost = await Post.findById(payload.post).populate(
    "author",
    "_id",
  );
  if (!existsPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }
  payload.user = new mongoose.Types.ObjectId(userId);

  // scalable way to comment
  const MAX_DEPTH = 2; // maximum depth for replies
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let depth = 0;

    // check if replying to a comment
    if (parentComment) {
      const parent = await Comment.findById(parentComment).session(session);

      if (!parent) {
        throw new Error("Parent comment not found");
      }
      if (parent.depth >= MAX_DEPTH) {
        throw new Error("Maximum reply depth exceeded");
      }

      depth = parent.depth + 1;

      // increment reply count atomically
      await Comment.findByIdAndUpdate(
        parentComment,
        { $inc: { replyCount: 1 } },
        { session },
      );
    }

    const newComment = await Comment.create(
      [
        {
          post: post,
          user: userId,
          content,
          parentComment: parentComment || null,
          depth,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // create notification on comment
    await NotificationService.createNotification({
      recipient: existsPost.author._id,
      sender: new mongoose.Types.ObjectId(userId),
      type: "post_comment",
      resourceType: "Post",
      resourceId: payload.post,
    });

    return newComment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create comment",
    );
  }
};

/**
 * -------------- get all comments (replies more than 3 are discarded)  --------------
 * Rule 1: all root comments paginated with page and limit. by default newest first.
 * Rule 2: if root comment has replies >=3, only 3 replies are returned. else all returns.
 * and show load more 12+ comments. we have antoher api to fetch more replies for that root comment with controlled way.
 *
 * @param postId post to views all comments
 * @param query page, limit, sort
 * @returns paginated comments and its chil comments
 */
const getAllCommentsFromDB = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  // i allowed maximum 3 replies to load with root comment.
  const MAX_REPLY_COUNT = 3;

  // pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // fetch root comments
  const rootComments = await Comment.find({
    post: postId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const rootIds = rootComments.map((r) => r._id);

  // if no comments. return empty array
  if (rootIds.length === 0) {
    return {
      comments: [],
      page,
      limit,
      hasNextPage: false,
    };
  }

  // fetch all depth 1 comments for those root comments
  const replies: TComment[] = await Comment.find({
    parentComment: { $in: rootIds },
    depth: 1,
  })
    .sort({ createdAt: 1 })
    .lean();

  // group replies by parentComment id
  const replyMap = new Map<string, TComment[]>();

  for (const reply of replies) {
    const parentId = reply.parentComment!.toString();
    if (!replyMap.has(parentId)) {
      replyMap.set(parentId, []);
    }
    replyMap.get(parentId)!.push(reply);
  }

  // limit replies those parent comment has more than 3 replies and add hasMoreReplies flag to show load more on UI. we handle those by another api. this is by design and intetional to avoid heavy data load and response time.
  const structured = rootComments.map((root) => {
    const allReplies = replyMap.get(root._id.toString()) || [];

    const limitedReplies =
      root.replyCount > MAX_REPLY_COUNT
        ? allReplies.slice(0, MAX_REPLY_COUNT)
        : allReplies;

    return {
      ...root,
      replies: limitedReplies,
      hasMoreReplies: root.replyCount > MAX_REPLY_COUNT,
    };
  });

  // determine next page existence
  const totalRoots = await Comment.countDocuments({
    post: postId,
    parentComment: null,
  });

  const hasNextPage = page * limit < totalRoots;
  return {
    comments: structured,
    page,
    limit,
    hasNextPage,
  };
};

// -------------- get all comments for all posts  --------------
const getAllCommentsForPostsFromDB = async (postIds: string[]) => {
  const objectIds = postIds.map((id) => new mongoose.Types.ObjectId(id));
  const commentsCount = await Comment.aggregate([
    {
      $match: { post: { $in: objectIds } },
    },
    {
      $group: {
        _id: "$post",
        count: { $sum: 1 },
      },
    },
  ]);

  return commentsCount;
};

// -------------- get all comments of a post --------------
const getAllCommentsOfPostFromDB = async (postId: string) => {
  const result = await Comment.find({ post: postId }).populate({
    path: "user",
    select: "_id name email isVerified profilePicture premiumAccess",
  });
  return result;
};

// -------------- delete a comment --------------
const deleteACommentIntoDB = async (user: string, commentId: string) => {
  const result = await Comment.findOneAndDelete({
    _id: commentId,
    user,
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to delete");
  }
  return true;
};

// -------------- update a comment --------------
const updateACommentIntoDB = async (payload: Partial<TComment>) => {
  const result = await Comment.findOneAndUpdate(
    { _id: payload?._id, post: payload?.post },
    { comment: payload?.content },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "No comment to update!");
  }
  return result;
};

export const CommentServices = {
  createACommentIntoDB,
  getAllCommentsFromDB,
  getAllCommentsForPostsFromDB,
  getAllCommentsOfPostFromDB,
  deleteACommentIntoDB,
  updateACommentIntoDB,
};
