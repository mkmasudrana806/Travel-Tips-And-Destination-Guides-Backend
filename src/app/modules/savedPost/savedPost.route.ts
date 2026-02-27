import express from "express";
import { SavedPostController } from "./savedPost.controller";
import auth from "../../middlewares/auth";
const router = express.Router({ mergeParams: true });
const savedPostRouter = express.Router();

// saved a travel post
router.post("/", auth("user"), SavedPostController.savedPost);

// delete a saved post
router.delete("/", auth("user"), SavedPostController.deleteSavedPost);

// get all saved posts
savedPostRouter.get("/me", auth("user"), SavedPostController.getAllSavedPosts);

// for parent post
export const SavedPostRoutes = router;

// standalone root router
export const SavedRoutes = savedPostRouter;
