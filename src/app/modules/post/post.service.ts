import mongoose from "mongoose";
import TPost, { TPostCreate } from "./post.interface";
import Post from "./post.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { searchableFields } from "./post.constant";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { Media } from "../media/media.model";
import * as cheerio from "cheerio";
import { TJwtPayload } from "../../interface/JwtPayload";
import PostVote from "../postVote/postVote.model";

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
const getAllTravelPosts = async (query: any) => {
  const {
    location,
    category,
    country,
    minCost,
    maxCost,
    days,
    travelType,
    page = 1,
    limit = 10,
    sort = "latest",
  } = query;

  // make a query object
  const filter: any = {
    isDeleted: false,
  };

  // category filter
  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }
  // location filter
  if (location) {
    filter.locationName = { $regex: location, $options: "i" };
  }

  // country filter
  if (country) {
    filter.country = { $regex: country, $options: "i" };
  }

  // cost range. as i received min and max. so i will keep only in range budget
  if (minCost || maxCost) {
    filter.estimatedCost = {};
    if (minCost) filter.estimatedCost.$gte = Number(minCost);
    if (maxCost) filter.estimatedCost.$lte = Number(maxCost);
  }

  // travel days
  if (days) {
    filter.travelDays = Number(days);
  }

  // travel type
  if (travelType) {
    filter.travelType = travelType;
  }

  // sorting by default latest
  // but user can sort based on cost, upvote counts
  let sortOption: any = { createdAt: -1 };

  if (sort === "cheapest") {
    sortOption = { estimatedCost: 1 };
  } else if (sort === "popular") {
    sortOption = { upvoteCount: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const posts = await Post.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .populate("author", "name profilePicture");

  // create meta data
  const total = await Post.countDocuments(filter);
  const meta = {
    total,
    page: Number(page),
    limit: Number(limit),
  };

  return {
    data: posts,
    meta,
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
    Post.find({ author: userId, isDeleted: false }).populate({
      path: "author",
      select: "_id name email isVerified profilePicture premiumAccess",
    }),
    query,
  )
    .filter()
    .search(searchableFields)
    .fieldsLimiting()
    .paginate()
    .sort();

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
  const [post, postVote] = await Promise.all([
    Post.findOne({ _id: postId, isDeleted: false })
      .populate({
        path: "author",
        select: "_id name isVerified profilePicture",
      })
      .lean(),
    viewerId ? PostVote.findOne({ post: postId, user: viewerId }).lean() : null,
  ]);

  if (!post) throw new Error("Post not found");

  // is owner
  const isOwner = viewerId === post.author._id.toString();

  // isVoted
  const isVoted = { status: !!postVote, voteType: postVote?.type || null };
  return { ...post, isVoted, isOwner };
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
    isDeleted: false,
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
    { _id: postId, author: userId, isDeleted: false },
    payload,
    {
      new: true,
    },
  );
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, "Post not found or update failed");
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
        isDeleted: false,
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
        isDeleted: false,
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
