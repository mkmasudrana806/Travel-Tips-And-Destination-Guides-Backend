## API References

Base API: `/api/v1`

## Access Levels

- `public` → No authentication required
- `user` → Requires logged-in user
- `admin` → Requires admin role

## Authentication Header

Protected routes require an access token.

```
Authorization: Bearer <access_token>
```

## Pagination Response

Endpoints that support pagination return a `meta` object.

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 56
  },
  "data": []
}
```

## Query Parameters (Where Supported)

- `search` → Text search
- `sort` → Sorting (`sort=createdAt` or `sort=-createdAt`)
- `page` → Page number
- `limit` → Items per page
- `fields` → Select fields
- Any field name → Exact match filtering

Before enter into chapter. Please visit 
- [API Design Strategies](/docs/api-design.md)
- [Data Model](/docs/data-model.md)

# User

| Method | Endpoint                | Access | Description        |
| ------ | ----------------------- | ------ | ------------------ |
| POST   | `/users`                | public | Create user        |
| GET    | `/users`                | admin  | Get all users      |
| GET    | `/users/me`             | user   | Get my profile     |
| GET    | `/users/:userId`        | public | Get user profile   |
| PUT    | `/users`                | user   | Update profile     |
| DELETE | `/users/:userId`        | admin  | Delete user        |
| PATCH  | `/users/:userId/status` | admin  | Toggle user status |
| PATCH  | `/users/:userId/role`   | admin  | Toggle user role   |
| PATCH  | `/users/verification`   | user   | Verify account     |

Example:

```
GET /users?searchTerm=masud&page=1&limit=10&sort=-createdAt
```

# User Follow

### Nested under `/users/:userId`

| Method | Endpoint                    | Access | Description            |
| ------ | --------------------------- | ------ | ---------------------- |
| POST   | `/users/:userId/follow`     | user   | Follow / unfollow user |
| GET    | `/users/:userId/followers`  | public | Get followers          |
| GET    | `/users/:userId/followings` | public | Get followings         |
| GET    | `/users/:userId/mutual`     | public | Get mutual connections |

Example:

```
GET /users/:userId/followers?page=1&limit=20
```

---

# Post

| Method | Endpoint         | Access      | Description     |
| ------ | ---------------- | ----------- | --------------- |
| POST   | `/posts`         | user        | Create post     |
| GET    | `/posts`         | public      | Get all posts   |
| GET    | `/posts/me`      | user        | Get my posts    |
| GET    | `/posts/:postId` | public      | Get single post |
| PATCH  | `/posts/:postId` | user        | Update post     |
| DELETE | `/posts/:postId` | user, admin | Delete post     |

Example:

```
GET /posts?category=beach&page=1&limit=8&sort=-createdAt
```

---

# Post Share

### Nested under `/posts/:postId`

| Method | Endpoint                              | Access | Description        |
| ------ | ------------------------------------- | ------ | ------------------ |
| POST   | `/posts/:postId/shares`               | user   | Share post         |
| GET    | `/posts/:postId/shares`               | public | Get post shares    |
| DELETE | `/posts/:postId/shares/:sharedPostId` | user   | Delete shared post |

Example:

```
GET /posts/:postId/shares?page=1&limit=10
```

---

# Post Vote

### Nested under `/posts/:postId`

| Method | Endpoint               | Access | Description |
| ------ | ---------------------- | ------ | ----------- |
| POST   | `/posts/:postId/votes` | user   | Vote post   |
| GET    | `/posts/:postId/votes` | public | Get voters  |

Standalone route:

| Method | Endpoint    | Access | Description       |
| ------ | ----------- | ------ | ----------------- |
| GET    | `/votes/me` | user   | Get posts I voted |

Example:

```
GET /posts/:postId/votes?page=1&limit=15
```

---

# Saved Post

### Nested under `/posts/:postId`

| Method | Endpoint                     | Access | Description       |
| ------ | ---------------------------- | ------ | ----------------- |
| POST   | `/posts/:postId/saved-posts` | user   | Save post         |
| DELETE | `/posts/:postId/saved-posts` | user   | Remove saved post |

Standalone route:

| Method | Endpoint          | Access | Description     |
| ------ | ----------------- | ------ | --------------- |
| GET    | `/saved-posts/me` | user   | Get saved posts |

Example:

```
GET /saved-posts/me?page=1&limit=10
```

---

# Comment

### Nested under `/posts/:postId`

| Method | Endpoint                  | Access | Description       |
| ------ | ------------------------- | ------ | ----------------- |
| POST   | `/posts/:postId/comments` | user   | Create comment    |
| GET    | `/posts/:postId/comments` | public | Get root comments |

Standalone routes:

| Method | Endpoint                       | Access | Description    |
| ------ | ------------------------------ | ------ | -------------- |
| GET    | `/comments/:commentId/replies` | public | Get replies    |
| PATCH  | `/comments/:commentId`         | user   | Update comment |
| DELETE | `/comments/:commentId`         | user   | Delete comment |

Example:

```
GET /posts/:postId/comments?page=1&limit=5
```

---

# Travel Plan

| Method | Endpoint                | Access | Description        |
| ------ | ----------------------- | ------ | ------------------ |
| POST   | `/travel-plans`         | user   | Create travel plan |
| GET    | `/travel-plans`         | public | Get travel plans   |
| GET    | `/travel-plans/me`      | user   | Get my plans       |
| GET    | `/travel-plans/:planId` | public | Get single plan    |
| PATCH  | `/travel-plans/:planId` | user   | Update plan        |
| DELETE | `/travel-plans/:planId` | user   | Delete plan        |

Example:

```
GET /travel-plans?destination=Sylhet&page=1&limit=6
```

---

# Travel Request

### Nested under `/travel-plans/:planId`

| Method | Endpoint                                    | Access | Description       |
| ------ | ------------------------------------------- | ------ | ----------------- |
| POST   | `/travel-plans/:planId/requests`            | user   | Create request    |
| GET    | `/travel-plans/:planId/requests`            | user   | Get plan requests |
| PATCH  | `/travel-plans/:planId/requests/:requestId` | user   | Update request    |
| PUT    | `/travel-plans/:planId/requests/:requestId` | user   | Cancel request    |

Standalone route:

| Method | Endpoint              | Access | Description     |
| ------ | --------------------- | ------ | --------------- |
| GET    | `/travel-requests/me` | user   | Get my requests |

Example:

```
GET /travel-plans/:planId/requests?page=1&limit=10
```

---

# Notification

| Method | Endpoint                              | Access | Description       |
| ------ | ------------------------------------- | ------ | ----------------- |
| GET    | `/notifications/me`                   | user   | Get notifications |
| PATCH  | `/notifications/:notificationId/read` | user   | Mark as read      |
| PATCH  | `/notifications/read-all`             | user   | Mark all as read  |
| GET    | `/notifications/unread/count`         | user   | Get unread count  |

Example:

```
GET /notifications/me?page=1&limit=10
```

---

# Payment

| Method | Endpoint              | Access | Description                |
| ------ | --------------------- | ------ | -------------------------- |
| POST   | `/payments`           | user   | Initiate payment           |
| POST   | `/payments/success`   | public | Payment success callback   |
| POST   | `/payments/failed`    | public | Payment failed callback    |
| POST   | `/payments/cancelled` | public | Payment cancelled callback |
| GET    | `/payments/me`        | user   | Get my payments            |
| GET    | `/payments`           | admin  | Get all payments           |

Example:

```
GET /payments?page=1&limit=10&status=success
```

---

# Media Upload

| Method | Endpoint | Access      | Description |
| ------ | -------- | ----------- | ----------- |
| POST   | `/media` | user, admin | Upload file |
