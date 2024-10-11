import TPost from "./post.interface";

// allowed fields to update post
export const allowedFieldsToUpdate: (keyof TPost)[] = [
  "title",
  "content",
  "category",
  "image",
  "premium",
];

// search able fields to search
export const searchableFields = ["author.name", "title", "category"];
