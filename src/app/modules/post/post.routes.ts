import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { PostControllers } from "./post.controller";
import { PostValidtions } from "./post.validation";
import validateRequestData from "../../middlewares/validateRequest";
import { upload } from "../../utils/upload";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { CloudinaryMulterUpload } from "../../config/multer.config";

const router = express.Router();
// create a new post
router.post(
  "/create-post",
  auth("user"),
  // upload.single("file"),
  CloudinaryMulterUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = JSON.parse(req.body?.data);
      next();
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Please provide post data");
    }
  },
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

// upvote a post
router.patch("/upvote/:postId", auth("user"), PostControllers.upvotePost);

// downvote a post
router.patch("/downvote/:postId", auth("user"), PostControllers.downvotePost);

export const PostRoutes = router;
