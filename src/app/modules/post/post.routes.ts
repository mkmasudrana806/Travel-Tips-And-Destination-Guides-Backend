import express from "express";
import auth from "../../middlewares/auth";
import { PostControllers } from "./post.controller";
import { PostValidtions } from "./post.validation";
import validateRequestData from "../../middlewares/validateRequest";
import optionalAuth from "../../middlewares/optionalAuth";
import { PostShareRoutes } from "../postShare/postShare.route";
import { PostVoteRoutes } from "../postVote/postVote.routes";
import { SavedPostRoutes } from "../savedPost/savedPost.route";

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

// route to its child 'PostShare' routes
router.use("/:postId/shares", PostShareRoutes);

// middleware for 'votes' child route
router.use("/:postid/votes", PostVoteRoutes);

// for '/saved-posts' children
router.use("/:postId/saved-posts", SavedPostRoutes);

export const PostRoutes = router;
