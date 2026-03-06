import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TAllCommentsResponse, TComment } from "./comment.interface";
import { Comment } from "./comment.model";
import mongoose from "mongoose";
import { NotificationService } from "../notifications/notifications.service";
import Post from "../post/post.model";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { COMMENT_QUERY_OPTIONS } from "./comment.query";

/**
 * -------------- create a comment into db --------------
 *
 * @param userId user who want to comment
 * @param postId post to comment
 * @param payload payload for comment
 * @returns new comment data
 */
const createAComment = async (
  userId: string,
  postId: string,
  payload: Partial<TComment>,
) => {
  const { content, parentComment } = payload;

  // check post exists or not
  const existsPost = await Post.findById(postId)
    .populate("author", "_id")
    .lean();
  if (!existsPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }
  payload.user = existsPost.author._id;

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
          post: postId,
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
      resourceId: existsPost._id,
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
 * @param viewerId who viewing all comments of a post. owner/users(logged in/out)
 * @param postId post to views all comments
 * @param query page, limit, sort
 * @returns paginated comments and its chil comments
 */
const getAllComments = async (
  viewerId: string,
  postId: string,
  query: Record<string, unknown>,
) => {
  // i allowed maximum 3 replies to load with root comment.
  const MAX_REPLY_COUNT = 3;

  const queryBuilder = new QueryBuilder(
    Comment.find({
      post: postId,
      parentComment: null,
    }),
    query,
    COMMENT_QUERY_OPTIONS,
  )
    .sort()
    .fieldsLimiting()
    .paginate()
    .lean();

  // fetch root comments
  const rootComments = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  const rootIds = rootComments.map((r) => r._id);

  // if no comments. return empty array
  if (rootIds.length === 0) {
    return {
      data: [],
      meta,
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

  let data: TAllCommentsResponse[];
  // if viewer is not logged in
  if (!viewerId) {
    data = structured.map((root) => ({
      data: {
        ...root,
        replies: root.replies.map((reply) => ({
          data: reply,
          viewerContext: {
            isOwner: false,
          },
        })),
      },
      viewerContext: {
        isOwner: false,
      },
    }));

    return { meta, data };
  }

  // for logged in user
  data = structured.map((root) => ({
    data: {
      ...root,
      replies: root.replies.map((reply) => ({
        data: reply,
        viewerContext: {
          isOwner: reply.user.toString() === viewerId,
        },
      })),
    },
    viewerContext: {
      isOwner: root.user?.toString() === viewerId,
    },
  }));

  return { meta, data };
};

/**
 * -------------- get all replies of a comment --------------
 * @param viewerId who viewing comments (if logged in)
 * @param parentCommentId comment id to retrieve all replies
 * @param query page and limit
 */
const getRepliesOfComment = async (
  viewerId: string,
  parentCommentId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const replies = await Comment.find({
    parentComment: parentCommentId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Comment.countDocuments({
    parentComment: parentCommentId,
  });
  const hasNextPage = page * limit < total;
  const meta = { limit, page, total, hasNextPage };

  // if viewer is not logged in, so isOwner=false for all
  let data: TAllCommentsResponse[];
  if (!viewerId) {
    data = replies.map((reply) => ({
      data: {
        ...reply,
      },
      viewerContext: {
        isOwner: false,
      },
    }));

    return { meta, data };
  }

  // if user logged in, then check any comment belong to this viewer user
  data = replies.map((reply) => ({
    data: {
      ...reply,
    },
    viewerContext: {
      isOwner: reply.user.toString() === viewerId,
    },
  }));

  return { meta, data };
};

// -------------- delete a comment --------------
const deleteAComment = async (commentId: string, userId: string) => {
  const result = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      user: userId,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Comment not found");
  }
  return { isDeleted: result ? true : false };
};

// -------------- update a comment --------------
const updateAComment = async (
  commentId: string,
  userId: string,
  payload: Partial<TComment>,
) => {
  const result = await Comment.findOneAndUpdate(
    { _id: commentId, user: userId },
    { comment: payload.content, isEdited: true },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Comment not found or unauthorized!",
    );
  }
  return result;
};

export const CommentServices = {
  createAComment,
  getAllComments,
  getRepliesOfComment,
  deleteAComment,
  updateAComment,
};
