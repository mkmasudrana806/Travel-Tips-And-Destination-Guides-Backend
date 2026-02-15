import express from "express";
import auth from "../../middlewares/auth";
import { PostControllers } from "./post.controller";
import { PostValidtions } from "./post.validation";
import validateRequestData from "../../middlewares/validateRequest";

const router = express.Router();

// create a new post
router.post(
  "/create-post",
  auth("user"),
  validateRequestData(PostValidtions.createPostValidationSchema),
  PostControllers.createPost,
);

// get all posts
router.get("/", PostControllers.getAllPosts);

// get my posts
router.get("/my-posts/:userId", PostControllers.getUserPosts);

// get single post
router.get("/:id", PostControllers.getPost);

// update a post
router.patch(
  "/:id",
  auth("user"),
  validateRequestData(PostValidtions.updatePostValidationSchema),
  PostControllers.updatePost,
);

// delete a post
router.delete("/:id", auth("user", "admin"), PostControllers.deletePost);

// filter post based on user queries
router.get("/advanced/hard/filtered", PostControllers.getFilteredTravelPosts);

export const PostRoutes = router;
