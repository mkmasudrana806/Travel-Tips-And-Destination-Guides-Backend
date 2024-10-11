import { Types } from "mongoose";

type TPost = {
  author: Types.ObjectId;
  title: string;
  content: string;
  category: "Adventure" | "Business Travel" | "Exploration" | "Other";
  image: string;
  premium: boolean;
  upvotes: string[];
  downvotes: string[];
  isDeleted: boolean;
};

export default TPost;
