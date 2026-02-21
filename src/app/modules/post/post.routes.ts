import express from "express";
import auth from "../../middlewares/auth";
import { PostControllers } from "./post.controller";
import { PostValidtions } from "./post.validation";
import validateRequestData from "../../middlewares/validateRequest";
import optionalAuth from "../../middlewares/optionalAuth";

const router = express.Router();

// create a new post
router.post(
  "/",
  auth("user"),
  validateRequestData(PostValidtions.createPostValidationSchema),
  PostControllers.createPost,
);

// get all posts with filter, pagination and sorting
router.get("/", PostControllers.getAllTravelPosts);

// get my posts
router.get("/me", auth("user"), PostControllers.getMyPosts);

// get single post
router.get("/:postId", optionalAuth(), PostControllers.getSinglePost);

// update a post
router.patch(
  "/:postId",
  auth("user"),
  validateRequestData(PostValidtions.updatePostValidationSchema),
  PostControllers.updatePost,
);

// delete a post
router.delete("/:postId", auth("user", "admin"), PostControllers.deletePost);

export const PostRoutes = router;
