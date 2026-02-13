import { Types } from "mongoose";

type TPost = {
  author: Types.ObjectId;
  title: string;
  content: string;
  category: "Adventure" | "Business Travel" | "Exploration";
  image: string;
  premium: boolean;
  upvoteCount: number;
  downvoteCount: number;
  isDeleted: boolean;
};

export type TPostCreate = TPost & { bannerId: string; contentIds: string[] };

export default TPost;
