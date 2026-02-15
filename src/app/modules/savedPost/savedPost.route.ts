import express from "express";
import { SavedPostController } from "./savedPost.controller";
import auth from "../../middlewares/auth";
const router = express.Router();

// saved a travel post
router.post("/:postId", auth("user"), SavedPostController.savedPost);

// delete a saved post
router.delete("/:postId", auth("user"), SavedPostController.deleteSavedPost);

export const SavedPostRoutes = router;
