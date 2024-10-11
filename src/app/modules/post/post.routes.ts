import express from "express";
import auth from "../../middlewares/auth";
import { PostControllers } from "./post.controller";

const router = express.Router();
// create a new post
router.post("/", auth("user"), PostControllers.createPost);

// get all posts
router.get("/", PostControllers.getAllPosts);

// get my posts
router.get("/my-posts", auth("user"), PostControllers.getUserPosts);

// get single post
router.get("/:id", PostControllers.getPost);

// update a post
router.patch("/:id", auth("user"), PostControllers.updatePost);

// delete a post
router.delete("/:id", auth("user"), PostControllers.deletePost);

// upvote a post
router.patch("/upvote/:postId", auth("user"), PostControllers.upvotePost);

// downvote a post
router.patch("/downvote/:postId", auth("user"), PostControllers.downvotePost);

export const PostRoutes = router;
