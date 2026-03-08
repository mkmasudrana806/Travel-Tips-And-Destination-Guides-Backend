import { Types } from "mongoose";

export type TPostCategory = "Adventure" | "Business Travel" | "Exploration";
export type TTravelType = "budget" | "midrange" | "luxury";

type TPost = {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  content: string;
  category: TPostCategory;
  locationName: string;
  country: string;
  travelDays: number;
  estimatedCost: number;
  travelType: TTravelType;
  image: string;
  premium: boolean;
  upvoteCount: number;
  downvoteCount: number;
  isDeleted: boolean;
};

export type TPostCreate = TPost & { bannerId: string; contentIds: string[] };

// viewer context for single post view
export type TPostViewerContext = {
  voteType: "upvote" | "downvote" | "none";
  isOwner: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
};

// viewer context individually for each post
export type TAllPostsResponse = {
  data: TPost;
  viewerContext: TPostViewerContext;
};

export default TPost;
