import mongoose, { mongo, Schema, Types } from "mongoose";
import TPost from "./post.interface";
import Post from "./post.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { allowedFieldsToUpdate, searchableFields } from "./post.constant";
import QueryBuilder from "../../queryBuilder/queryBuilder";

/**
 * ------------- Create a new post ----------------
 * @param userId logged in user
 * @param payload new post data
 * @returns newly created post
 */
const createPostIntoDB = async (userId: Types.ObjectId, payload: TPost) => {
  payload.author = userId;
  const newPost = await Post.create(payload);
  return newPost;
};

/**
 * ----------- Get all posts ---------
 * @param query req.query object
 * @returns all posts
 */
const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find({}).populate({
      path: "author",
      select: "_id name email isVerified",
    }),
    query
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
 * ----------- Get user posts   ---------
 * @param query req.query object
 * @returns all posts
 */
const getUserPostsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const postQuery = new QueryBuilder(
    Post.find({ author: userId }).populate({
      path: "author",
      select: "_id name email isVerified",
    }),
    query
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
  const post = await Post.findById(postId).populate({
    path: "author",
    select: "_id name email isVerified profilePicture",
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
  user: JwtPayload,
  postId: string,
  payload: Partial<TPost>
) => {
  const updatedPost = makeAllowedFieldData<TPost>(
    allowedFieldsToUpdate,
    payload
  );

  const result = await Post.findOneAndUpdate(
    { _id: postId, author: user?.userId },
    updatedPost,
    {
      new: true,
    }
  );
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, "Post not found or update failed");
  return result;
};

// Delete a post by its ID
const deleteAPostFromDB = async (userId: string, postId: string) => {
  const deletedPost = await Post.findOneAndUpdate(
    {
      author: userId,
      postId: postId,
    },
    { isDeleted: true },
    { new: true }
  );
  if (!deletedPost) throw new Error("Post not found or deletion failed");
  return deletedPost;
};

/**
 * ------------------ upvote a post ----------------
 * @param currentUser current user
 * @param postId post id to upvote
 * @validation add user to upvoted as well as remove user from downvoted if present
 * @returns return true if upvote added, else false
 */
const upvotePostIntoDB = async (currentUser: JwtPayload, postId: string) => {
  // Check if the post exists
  const targetPost = await Post.findById(postId);
  if (!targetPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found!");
  }

  // Check if user has already upvoted the post
  const isAlreadyUpvote = targetPost.upvotes?.includes(currentUser.userId);

  if (isAlreadyUpvote) {
    // Remove the upvote: Remove user from the post's upvotes list
    await Post.updateOne(
      { _id: postId },
      { $pull: { upvotes: currentUser.userId } }
    );
    return { message: "Upvote removed", upvoted: false };
  } else {
    // Add upvote and remove from downvotes in a single query
    await Post.updateOne(
      { _id: postId },
      {
        $addToSet: { upvotes: currentUser.userId },
        $pull: { downvotes: currentUser.userId },
      }
    );
    return { message: "Upvote added", upvoted: true };
  }
};

/**
 * ------------------ downvote a post ----------------
 *
 * @param currentUser current user
 * @param postId post id to upvote
 * @validation add user to downvoted as well as remove user from upvoted if present
 * @returns return true if downvote added, else false
 */
const downvotePostIntoDB = async (currentUser: JwtPayload, postId: string) => {
  // Check if the post exists
  const targetPost = await Post.findById(postId);
  if (!targetPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found!");
  }

  // Check if user has already downvoted the post
  const isAlreadyDownvoted = targetPost.downvotes?.includes(currentUser.userId);

  if (isAlreadyDownvoted) {
    // Remove the downvote: Remove user from the post's downvotes list
    await Post.updateOne(
      { _id: postId },
      { $pull: { downvotes: currentUser.userId } }
    );
    return { message: "Downvote removed", downvoted: false };
  } else {
    // Add downvote and remove from upvotes in a single query
    await Post.updateOne(
      { _id: postId },
      {
        $addToSet: { downvotes: currentUser.userId },
        $pull: { upvotes: currentUser.userId },
      }
    );
    return { message: "Downvote added", downvoted: true };
  }
};

export const PostServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  getUserPostsFromDB,
  getSinglePostFromDB,
  deleteAPostFromDB,
  updateAPostIntoDB,
  upvotePostIntoDB,
  downvotePostIntoDB,
};
