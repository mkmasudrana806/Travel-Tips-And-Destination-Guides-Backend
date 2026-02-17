import mongoose, { Types } from "mongoose";
import TPost, { TPostCreate } from "./post.interface";
import Post from "./post.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { allowedFieldsToUpdate, searchableFields } from "./post.constant";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { Media } from "../media/media.model";
import * as cheerio from "cheerio";
import { TJwtPayload } from "../../interface/JwtPayload";

/**
 * ------------- Create a new post ----------------
 * @param userId logged in user
 * @param payload new post data
 * @returns newly created post
 */
const createPostIntoDB = async (userId: string, payload: TPostCreate) => {
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
 * ----------- Get all posts ---------
 * @param query req.query object
 * @returns all posts
 */
const getAllPostsFromDB = async (queries: Record<string, unknown>) => {
  const { sortBy, ...query } = queries;
  let result;
  const postQuery = new QueryBuilder(
    Post.find({ isDeleted: false }).populate({
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

  result = await postQuery.modelQuery;
  return result;
};

/**
 * ----------- Get user posts   ---------
 * @param query req.query object
 * @returns all posts
 */
const getUserPostsFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
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

  const result = await postQuery.modelQuery;
  return result;
};

/**
 * --------------- Get a single post by its ID -------------
 * @param postId post ID
 * @returns return single post
 */
const getSinglePostFromDB = async (postId: string) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false }).populate({
    path: "author",
    select: "_id name email isVerified profilePicture premiumAccess",
  });
  if (!post) throw new Error("Post not found");
  return post;
};

/**
 * -----------------Update a post by its ID --------------
 * @param user logged in user id
 * @param postId post id to update
 * @param payload updated post data
 * @returns return updated post data
 */
const updateAPostIntoDB = async (
  user: TJwtPayload,
  postId: string,
  payload: Partial<TPost>,
) => {
  // make updated post data
  const updatedPostData = makeAllowedFieldData<TPost>(
    allowedFieldsToUpdate,
    payload,
  );

  // update into database
  const result = await Post.findOneAndUpdate(
    { _id: postId, author: user?.userId, isDeleted: false },
    updatedPostData,
    {
      new: true,
    },
  );
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, "Post not found or update failed");
  return result;
};

// Delete a post by its ID
/**
 *
 * @param userId user id from jwt payload
 * @param postId post id to delete
 * @returns deleted post
 */
const deleteAPostFromDB = async (user: TJwtPayload, postId: string) => {
  let deletedPost;
  if (user?.role === "user") {
    deletedPost = await Post.findOneAndUpdate(
      {
        author: user?.userId,
        _id: postId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true },
    );
  } else if (user?.role === "admin") {
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

/**
 * -------- get filtered travel posts based on user queries -----------
 *
 * @param query query params like country, location, limit, page, travel type etc
 * @returns returned filtered travel post based on query with pagination
 */
const getFilteredTravelPosts = async (query: any) => {
  const {
    location,
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

export const PostServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  getUserPostsFromDB,
  getSinglePostFromDB,
  deleteAPostFromDB,
  updateAPostIntoDB,
  getFilteredTravelPosts,
};
