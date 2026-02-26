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

// delete a shared post
router.delete(
  "/:sharedPostId",
  auth("user"),
  PostShareController.deleteSharedPost,
);

// get all shares of a post
router.get("/", PostShareController.getSharedPosts);

export const PostShareRoutes = router;
