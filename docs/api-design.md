## API Design Strategy

### Overview

The API follows RESTful principles with a focus on clarity, predictability, and scalability. Which uses versioning system api design: `/api/v1`

Endpoints are resource-oriented and structured around domain entities such as users, posts, comments, travel plans, and follows.

The design prioritizes:

- Consistent naming
- Clear separation of public and protected routes
- Context-aware responses
- Controlled data fetching


## Resource-Based Routing at **routes/index.ts** file

Endpoints are organized by domain resources:

```
/auth
/users
/posts
/comments
/travel-plans
/travel-requests
/follows
/notifications
```

Nested relationships are expressed semantically when appropriate:

```
GET /posts/:postId/comments
GET /comments/:commentId/replies
GET /users/:userId/followers
```

## HTTP Method Usage

Standard HTTP methods are used consistently:

- `GET` → Retrieve resource(s)
- `POST` → Create resource
- `PATCH` → Partial update
- `DELETE` → Remove resource

Examples:

```
POST   /posts
GET   /posts
PATCH  /posts/:id
DELETE /posts/:id
```

## Authentication Strategy in API Design

Two middleware patterns are used:

### Auth

Used for protected routes such as:

- Creating posts
- Commenting
- Following users
- Sending travel requests

### optionalAuth

Used for public routes that support personalization:

- User profile
- Single post view
- Travel plan view
- Comment listing

## Context-Aware Response Pattern

Certain endpoints return additional fields when a user is authenticated. For get all posts endpoint,

Examples:

- `voteType`
- `isOwner`
- `isSaved`
- `isFollowingAuthor`

## Pagination Strategy

Pagination is applied consistently using:

```
?page=1&limit=20
```

For hierarchical data:

- Root entities are paginated.
- Nested entities are lazily loaded.
- Separate endpoints are used for child resources.

Example:

```
GET /posts/:postId/comments
GET /comments/:commentId/replies
```

This prevents over-fetching and ensures predictable performance.

## Response Structure

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "User register sucessfull",
  "data": {},
  "meta": {}, (optional)
  "viewerContext": {} (optional)
}
```


All response may not have **meta**, and **viewerContext** field. 

This ensures:

- Predictability
- Consistent frontend integration
- Clear error handling

## Error Handling

Errors are handled centrally using global error middleware.

Standardized error responses include:

```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [
    {
      "path": "email",
      "message": "Email already exists"
    }
  ]
}
```

Validation errors are handled using Zod.

## Query Filtering & Search

Query builder utilities are used to support:

- Filtering
- Sorting
- Searching
- Field selection

## Design Principles Followed

- Separation of concerns
- Consistent naming conventions
- Predictable response structure
- Resource-based routing
- Minimal over-fetching
- Explicit personalization handling
