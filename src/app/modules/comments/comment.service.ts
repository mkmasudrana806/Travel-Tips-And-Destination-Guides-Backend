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
  const MAX_DEPTH = 3; // maximum depth for replies
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
 * Comments are paginated based on root comments. if a root node has more than 3 replies, then only 3 replies are sent with root comment. and rest are discarded. in UI we can show load more like load 20+ comments whic will load all comments of that root comment.if less than 3 replies, then all replies are sent with root comment. later we will make another api route to fetch all comments of a root comment with pagination.
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
  // remaining comments of that root comment can be loaded by separate api route with pagination when only user want to see all comments. it is by design and intentionally i do it.
  const MAX_REPLY_COUNT = 3;

  // pagination and sorting
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // fetch root comments (paginated)
  const rootComments = await Comment.find({
    post: postId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // fetch replies for root comments if reply count is <= 3. else [] (in UI we can show load more like load 20+ comments. when clicked, by separate api call, all comments of that root comment will be loaded with pagination further)
  const rootIdsToLoadReplies = rootComments
    .filter((r) => r.replyCount <= MAX_REPLY_COUNT)
    .map((r) => r._id);

  let replies: any[] = [];

  if (rootIdsToLoadReplies.length > 0) {
    replies = await Comment.find({
      parentComment: { $in: rootIdsToLoadReplies },
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  if (rootIdsToLoadReplies.length === 0) {
    return {
      comments: [],
      page,
      limit,
      hasNextPage: false,
    };
  }

  const replyMap = new Map<string, any[]>();

  for (const reply of replies) {
    const key = reply.parentComment.toString();
    if (!replyMap.has(key)) {
      replyMap.set(key, []);
    }
    replyMap.get(key)!.push(reply);
  }

  const structured = rootComments.map((root) => ({
    ...root,
    replies:
      root.replyCount <= 3 ? replyMap.get(root._id.toString()) || [] : [],
  }));

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
