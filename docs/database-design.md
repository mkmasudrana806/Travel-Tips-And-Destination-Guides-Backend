## Database Design

The system uses MongoDB with Mongoose as the ODM layer.
The database schema is designed to prioritize scalability, relational clarity, and predictable query performance.

Instead of embedding large nested documents, the system uses reference-based relationships to avoid document growth issues and maintain flexibility.

## Core Collections

The main collections include:

- users
- posts
- comments
- follows
- travelPlans
- travelRequests
- notifications
- postVotes
- postshares
- savedPosts
- payments

Each collection is modeled using a separate Mongoose schema and organized per module.

## Relationship Strategy

The system primarily uses **reference-based relationships** (ObjectId references) instead of embedding.

Example:

- Post → references User
- Comment → references Post
- Follow → references two Users (self reference)
- TravelRequest → references User and TravelPlan
- and so on

This design avoids:

- Unbounded document growth
- MongoDB 16MB document size limitations
- Complex update operations on embedded arrays

## Comment System Design (Adjacency List Pattern)

The comment system supports nested replies using the adjacency list pattern.

### Comment Schema Core Fields

```
post: ObjectId
user: ObjectId
parentComment: ObjectId | null
depth: number
replyCount: number
```

### How Hierarchy Works

- Root comment → `parentComment = null`, `depth = 0`
- Reply to root → `parentComment = rootId`, `depth = 1`
- Reply to reply → `parentComment = replyId`, `depth = 2`

Depth is stored explicitly to:

- Control maximum nesting
- Simplify filtering
- Avoid recursive lookups

### Controlled Nesting Strategy

To maintain performance:

- Maximum depth is limited
- Only first-level replies are loaded by default
- Replies are lazily loaded using a separate endpoint

This prevents:

- Recursive population
- Large payload responses
- Deep tree traversal overhead

### Reply Loading Strategy

When fetching comments for a post:

1. Paginate root comments.
2. Fetch only level-1 replies.
3. Limit replies to a fixed number (e.g., 3).
4. If `replyCount > returned replies`, frontend shows “Load more”.

Additional replies are fetched using:

```
GET /comments/:commentId/replies
```

This approach ensures predictable performance even for highly engaged posts.

## Travel Plan & Request Relationship

Travel plans reference:

- Owner (User)
- Participants (User references)

Travel requests are stored separately:

```
plan: ObjectId
user: ObjectId
status: cancelled | pending | accepted | rejected
```

This design:

- Avoids embedding large request arrays inside plans
- Allows independent status updates
- Enables efficient indexing on user-plan relationship

## Indexing Strategy

Indexes are applied for frequently queried fields:

- `{ post: 1, parentComment: 1 }` for comment lookups
- `{ follower: 1, following: 1 }` for follow checks
- `{ plan: 1, user: 1 }` for travel requests
- `{ user: 1 }` for user-based filtering.
- and so on for others models.
