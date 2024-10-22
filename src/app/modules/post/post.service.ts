import { Types } from "mongoose";
import TPost from "./post.interface";
import Post from "./post.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import makeAllowedFieldData from "../../utils/allowedFieldUpdatedData";
import { allowedFieldsToUpdate, searchableFields } from "./post.constant";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TfileUpload } from "../../interface/fileUploadType";
import sendImageToCloudinary from "../../utils/sendImageToCloudinary";

/**
 * ------------- Create a new post ----------------
 * @param userId logged in user
 * @param payload new post data
 * @returns newly created post
 */
const createPostIntoDB = async (
  userId: Types.ObjectId,
  file: TfileUpload,
  payload: TPost
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image is not attached!");
  }

  const imageName = `${userId}-${payload.category}`;
  const path = file.path;
  const uploadedImage: any = await sendImageToCloudinary(path, imageName);
  if (!uploadedImage?.secure_url) {
    throw new AppError(httpStatus.FORBIDDEN, "Image is not uploaded");
  }
  payload.image = uploadedImage.secure_url;
  payload.author = userId;

  const newPost = await Post.create(payload);
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
    query
  )
    .filter()
    .search(searchableFields)
    .fieldsLimiting()
    .paginate()
    .sort();

  result = await postQuery.modelQuery;

  if (queries?.sortBy && result?.length > 0) {
    result = result.sort((a, b) => {
      if (sortBy === "+upvote") {
        return a.upvotes?.length - b.upvotes?.length;
      } else if (sortBy === "-upvote") {
        return b.upvotes?.length - a.upvotes?.length;
      } else if (sortBy === "+downvote") {
        return a.downvotes?.length - b.downvotes?.length;
      } else if (sortBy === "-downvote") {
        return b.downvotes?.length - a.downvotes?.length;
      } else {
        return 0;
      }
    });
  }
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
    Post.find({ author: userId, isDeleted: false }).populate({
      path: "author",
      select: "_id name email isVerified profilePicture premiumAccess",
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
  user: JwtPayload,
  postId: string,
  payload: Partial<TPost>
) => {
  // make updated post data
  const updatedPostData = makeAllowedFieldData<TPost>(
    allowedFieldsToUpdate,
    payload
  );

  // update into database
  const result = await Post.findOneAndUpdate(
    { _id: postId, author: user?.userId, isDeleted: false },
    updatedPostData,
    {
      new: true,
    }
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
const deleteAPostFromDB = async (user: JwtPayload, postId: string) => {
  let deletedPost;
  if (user?.role === "user") {
    deletedPost = await Post.findOneAndUpdate(
      {
        author: user?.userId,
        _id: postId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );
  } else if (user?.role === "admin") {
    deletedPost = await Post.findOneAndUpdate(
      {
        _id: postId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );
  }

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
      { _id: postId, isDeleted: false },
      { $pull: { upvotes: currentUser.userId } }
    );
    return { message: "Upvote removed", upvoted: false };
  } else {
    // Add upvote and remove from downvotes in a single query
    await Post.updateOne(
      { _id: postId, isDeleted: false },
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
  const targetPost = await Post.findOne({ _id: postId, isDeleted: false });
  if (!targetPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found!");
  }

  // Check if user has already downvoted the post
  const isAlreadyDownvoted = targetPost.downvotes?.includes(currentUser.userId);

  if (isAlreadyDownvoted) {
    // Remove the downvote: Remove user from the post's downvotes list
    await Post.updateOne(
      { _id: postId, isDeleted: false },
      { $pull: { downvotes: currentUser.userId } }
    );
    return { message: "Downvote removed", downvoted: false };
  } else {
    // Add downvote and remove from upvotes in a single query
    await Post.updateOne(
      { _id: postId, isDeleted: false },
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
