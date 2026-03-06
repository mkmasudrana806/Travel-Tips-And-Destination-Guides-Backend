export const COMMENT_QUERY_OPTIONS = {
  searchableFields: ["content"],
  filterableFields: ["post", "user", "parentComment", "isDeleted"],
  sortableFields: ["createdAt", "updatedAt", "replyCount"],
  selectableFields: [
    "post",
    "user",
    "content",
    "parentComment",
    "depth",
    "replyCount",
    "isEdited",
    "createdAt",
  ],
};
