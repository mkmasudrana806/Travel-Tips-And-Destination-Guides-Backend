import express from "express";
import { SavedPostController } from "./savedPost.controller";
import auth from "../../middlewares/auth";
const router = express.Router();

// saved a travel post
router.post("/:postId", auth("user"), SavedPostController.savedPost);

export const SavedPostRoutes = router;
