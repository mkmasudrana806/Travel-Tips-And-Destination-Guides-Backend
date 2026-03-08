import mongoose from "mongoose";
import TPost, {
  TAllPostsResponse,
  TPostCreate,
  TPostViewerContext,
} from "./post.interface";
import Post from "./post.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { searchableFields } from "./post.constant";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { Media } from "../media/media.model";
import * as cheerio from "cheerio";
import { TJwtPayload } from "../../interface/JwtPayload";
import PostVote from "../postVote/postVote.model";
import SavedPost from "../savedPost/savedPost.model";
import UserFollow from "../userFollow/userFollow.model";
import validateObjectId from "../../utils/validateObjectId";
import { POST_QUERY_OPTIONS } from "./post.query";

/**
 * ------------- Create a new post ----------------
 *
 * @param userId who will create the post
 * @param payload new post data
 * @returns newly created post
 */
const createPost = async (userId: string, payload: TPostCreate) => {
  payload.author = new mongoose.Types.ObjectId(userId);
  const { bannerId, contentIds, ...postData } = payload;

  // parsing the content
  const $ = cheerio.load(postData.content);
  const idsInEditor: string[] = [];

  // loop through all image inside content and received ids
  $("img").each((i, el) => {
    const id = $(el).attr("data-image-id");
    validateObjectId({ name: "data-image-id", value: id });
    if (id) idsInEditor.push(id);
  });

  // only keep ids that used only
  const finalContentIds = contentIds.filter((id) => idsInEditor.includes(id));

  // as banner image mandatory so add into all ids
  const allValidMediaIds = [...finalContentIds, bannerId];

  // update Media isUsed: true.
  // TODO: those are not used will be deleted by cron job
  if (allValidMediaIds.length > 0) {
    await Media.updateMany(
      { _id: { $in: allValidMediaIds } },
      { $set: { isUsed: true } },
    );
  }

  const newPost = await Post.create(postData);
  return newPost;
};

/**
 * -------- get filtered travel posts based on user queries -----------
 *
 * @param query query params like country, location, limit, page, travel type etc
 * @returns returned filtered travel post based on query with pagination
 */
const getAllTravelPosts = async (
  viewerId: string,
  query: Record<string, unknown>,
) => {
  const { minCost, maxCost, minDay, maxDay } = query;

  // base filter object for domain post specific filter apply.
  const baseFilter: any = {};

  // cost range filter
  if (minCost || maxCost) {
    baseFilter.estimatedCost = {};
    if (minCost) baseFilter.estimatedCost.$gte = Number(minCost);
    if (maxCost) baseFilter.estimatedCost.$lte = Number(maxCost);
  }

  // travel days range filter
  if (minDay || maxDay) {
    baseFilter.travelDays = {};
    if (minDay) baseFilter.travelDays.$gte = Number(minDay);
    if (maxDay) baseFilter.travelDays.$gte = Number(maxDay);
  }

  const queryBuilder = new QueryBuilder(
    Post.find(baseFilter),
    query,
    POST_QUERY_OPTIONS,
  )
    .search()
    .filter()
    .sort()
    .paginate()
    .fieldsLimiting()
    .populate({ path: "author", select: "name profilePicture" });

  const posts = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  // if user not logged in, means no viewerId
  let data: TAllPostsResponse[];
  if (!viewerId) {
    data = posts.map((post) => ({
      data: post,
      viewerContext: {
        voteType: "none",
        isOwner: false,
        isSaved: false,
        isFollowingAuthor: false,
      },
    }));

    return {
      meta,
      data,
    };
  }

  // for logged in user. return viewerContext
  /*
  voteType: "upvote" | "downvote" | "none";
  isOwner: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
  */
  const postIds = posts.map((post) => post._id);
  const authorIds = posts.map((post) => post.author._id);

  // bulk fetch viewer interactions in parallel
  const [votes, savedPosts, follows] = await Promise.all([
    PostVote.find({ user: viewerId, post: { $in: postIds } })
      .select("post type")
      .lean(),
    SavedPost.find({
      user: viewerId,
      post: { $in: postIds },
    })
      .select("post")
      .lean(),
    UserFollow.find({
      follower: viewerId,
      following: { $in: authorIds },
    })
      .select("following")
      .lean(),
  ]);

  // convert to map and set to lookup faster
  const voteMap = new Map(votes.map((v) => [v.post.toString(), v.type]));
  const savedSet = new Set(savedPosts.map((s) => s.post.toString()));
  const followSet = new Set(follows.map((f) => f.following.toString()));

  // now attached viewer context for all context
  data = posts.map((post) => {
    const postId = post._id.toString();
    const authorId = post.author._id.toString();
    // owner check
    const isOwner = authorId === viewerId;
    // if found then vote type else none fallback
    const voteType = (voteMap.get(postId) as "upvote" | "downvote") ?? "none";
    // if found then set true else false
    const isSaved = savedSet.has(postId);
    // similarly folling check
    const isFollowingAuthor = followSet.has(authorId);

    return {
      data: post,
      viewerContext: {
        voteType,
        isOwner,
        isSaved,
        isFollowingAuthor,
      },
    };
  });

  // return posts with viewer context for logged in user
  return {
    meta,
    data,
  };
};

/**
 * -------------- Get my all posts ----------------
 * @param userId who want to see his all posts
 * @param query req.query object
 * @returns all posts
 */
const getMyPosts = async (userId: string, query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find({ author: userId }),
    query,
    POST_QUERY_OPTIONS,
  )
    .search()
    .filter()
    .sort()
    .fieldsLimiting()
    .paginate()
    .populate({
      path: "author",
      select: "_id name email isVerified profilePicture premiumAccess",
    }).lean();

  const data = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return { meta, data };
};

/**
 * --------------- Get single post -------------
 *
 * @param postId post id to get details
 * @param viewerId who is viewing the post details
 * @returns post data with viewer states
 */
const getSinglePost = async (postId: string, viewerId: string) => {
  // check if post found
  const post = await Post.findById(postId)
    .populate({
      path: "author",
      select: "_id name isVerified profilePicture",
    })
    .lean();
  if (!post) throw new Error("Post not found");

  // fetch postVote, savedPost, and userFollow status
  const [postVote, savedPost, userFollow] = await Promise.all([
    viewerId ? PostVote.findOne({ post: postId, user: viewerId }).lean() : null,
    viewerId ? SavedPost.exists({ post: postId, user: viewerId }).lean() : null,
    viewerId
      ? UserFollow.exists({
          follower: viewerId,
          following: post.author._id,
        }).lean()
      : null,
  ]);

  /*
  voteType: "upvote" | "downvote" | "none"; done
  isOwner: boolean; done
  isSaved: boolean;
  isFollowingAuthor: boolean;
  */

  // is owner
  const isOwner = viewerId === post.author._id.toString();
  // vote type
  const voteType = postVote?.type ?? "none";
  // is post saved
  const isSaved = savedPost ? true : false;
  // is following author
  const isFollowingAuthor = userFollow ? true : false;

  const viewerContext: TPostViewerContext = {
    voteType,
    isOwner,
    isSaved,
    isFollowingAuthor,
  };

  return { data: post, viewerContext };
};

/**
 * -----------------Update a post  --------------
 * @param userId who want to update the post
 * @param postId post id to update
 * @param payload updated post data
 * @returns return updated post data
 */
const updateAPost = async (
  userId: string,
  postId: string,
  payload: Partial<TPost> & { contentIds: string[] },
) => {
  // check if the post exists and belongs to the user
  const post = await Post.findOne({
    _id: postId,
    author: userId,
  });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

  // if content changed and some media are removed or some added.
  // then we have to update media isUsed field accordingly
  if (payload.content) {
    const $ = cheerio.load(payload.content);
    const idsInEditor: string[] = [];
    // loop through all image inside content and received ids
    $("img").each((i, el) => {
      const id = $(el).attr("data-image-id");
      validateObjectId({ name: "data-image-id", value: id });
      if (id) idsInEditor.push(id);
    });

    // we have two task. 1st find out news ids which is not present in the contentIds but present in IdsInEditor. because those are the new media added in the content. those media isUsed should be true. 2nd find out removed media ids which is present in contentIds but not present in IdsInEditor. because those media is removed from the content. so we have to set isUsed false for those media. we don't allow to change banner id.

    if (payload.contentIds) {
      // new media ids which is added in the updated content. those media isUsed should be true
      const newMediaIds = idsInEditor.filter(
        (id) => !payload.contentIds.includes(id),
      );
      const removedMediaIds = payload.contentIds.filter(
        (id) => !idsInEditor.includes(id),
      );

      if (newMediaIds.length > 0) {
        await Media.updateMany(
          { _id: { $in: newMediaIds } },
          { $set: { isUsed: true } },
        );
      }

      if (removedMediaIds.length > 0) {
        await Media.updateMany(
          { _id: { $in: removedMediaIds } },
          { $set: { isUsed: false } },
        );
      }
    }
  }

  // update into database
  const result = await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    payload,
    {
      new: true,
    },
  );
  if (!result)
    throw new AppError(httpStatus.FORBIDDEN, "Post not found or update failed");
  return result;
};

/**
 * --------------- delete a post ---------------
 *
 * @param userId user who want to delete the post
 * @param postId post to delete
 * @returns deleted post
 */
const deleteAPost = async (user: TJwtPayload, postId: string) => {
  let deletedPost;
  // if user is normal user. then only allowed to delete his own post.
  if (user.role === "user") {
    deletedPost = await Post.findOneAndUpdate(
      {
        _id: postId,
        author: user.userId,
      },
      { isDeleted: true },
      { new: true },
    );
    // if user is an admin then allowed to delete any post.
    // because admin has the super power ha ha ha
  } else if (user.role === "admin") {
    deletedPost = await Post.findOneAndUpdate(
      {
        _id: postId,
      },
      { isDeleted: true },
      { new: true },
    );
  }

  if (!deletedPost) throw new Error("Post not found or deletion failed");
  return deletedPost;
};

export const PostServices = {
  createPost,
  getAllTravelPosts,
  getMyPosts,
  getSinglePost,
  deleteAPost,
  updateAPost,
};
