import express from "express";
import { PostShareController } from "./postShare.controller";
import auth from "../../middlewares/auth";
import { PostShareValidation } from "./postShare.validation";
import validateRequestData from "../../middlewares/validateRequest";

// it used as middelware inside it's parent posts
// posts/:postId/shares
const router = express.Router({ mergeParams: true });

// share a post
router.post(
  "/",
  auth("user"),
  validateRequestData(PostShareValidation.createPostShare),
  PostShareController.sharePost,
);

export const PostShareRoutes = router;
