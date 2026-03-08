## User

(GET `/users`)

**Searchable fields**
`name`, `email`, `address`

**Filterable fields**
`email`, `age`, `gender`, `address`, `role`, `status`, `isVerified`, `premiumAccess`, `isDeleted`

**Sortable fields**
`name`, `age`, `email`, `followerCount`, `followingCount`, `createdAt`, `updatedAt`

**Selectable fields**
`name`, `email`, `age`, `gender`, `address`, `role`, `status`, `isVerified`, `premiumAccess`

Example:

```http
GET /users?search=masud&role=user&page=1&limit=10&sort=-createdAt&fields=name,email
```


## UserFollow

(GET `/users/:userId/followers`)

(GET `/users/:userId/following`)

**Searchable fields**
*(none)*

**Filterable fields**
*(none)*

**Sortable fields**
`createdAt`, `updatedAt`

**Selectable fields**
*(none)*

Example:

```http
GET /user-follow?sort=-createdAt&page=1&limit=10
```

---

## Post

(GET `/posts`)

**Searchable fields**
`title`, `content`, `locationName`, `country`

**Filterable fields**
`author`, `category`, `country`, `locationName`, `travelDays`, `estimatedCost`, `travelType`, `premium`

**Sortable fields**
`createdAt`, `updatedAt`, `upvoteCount`, `downvoteCount`, `estimatedCost`, `travelDays`

**Selectable fields**
`title`, `category`, `locationName`, `country`, `travelDays`, `estimatedCost`, `travelType`, `image`, `premium`, `upvoteCount`, `downvoteCount`, `createdAt`

Example:

```http
GET /posts?search=beach&country=Thailand&travelType=solo&page=1&limit=10&sort=-createdAt&fields=title,country,travelDays
```

## PostShare

(GET `/posts/:postId/shares`)

**Searchable fields**
*(none)*

**Filterable fields**
*(none)*

**Sortable fields**
`createdAt`, `updatedAt`

**Selectable fields**
`post`, `user`, `caption`, `createdAt`, `updatedAt`

Example:

```http
GET /post-shares?sort=-createdAt&page=1&limit=10&fields=post,user,caption
```

---

## SavedPost

(GET `/posts/:postId/saved-posts`)

**Searchable fields**
`postTitle`, `postCategory`

**Filterable fields**
`postCategory`

**Sortable fields**
`createdAt`, `updatedAt`

**Selectable fields**
`postTitle`, `postCategory`, `createdAt`, `updatedAt`

Example:

```http
GET /saved-posts?search=beach&postCategory=adventure&page=1&limit=10&sort=-createdAt&fields=postTitle,postCategory
```


## Comment

(GET `/posts/:postId/comments`)

**Searchable fields**
`content`

**Filterable fields**
`post`, `user`, `parentComment`, `isDeleted`

**Sortable fields**
`createdAt`, `updatedAt`, `replyCount`

**Selectable fields**
`post`, `user`, `content`, `parentComment`, `depth`, `replyCount`, `isEdited`, `createdAt`

Example:

```http
GET /comments?search=nice&post=POST_ID&page=1&limit=10&sort=-createdAt&fields=content,user,replyCount
```

---

## TravelPlan

(GET `/travel-plans`)

**Searchable fields**
`startLocation`, `destination`, `note`

**Filterable fields**
`user`, `startLocation`, `destination`, `startDate`, `endDate`, `travelDays`, `minBudget`, `maxBudget`, `status`

**Sortable fields**
`createdAt`, `updatedAt`, `startDate`, `travelDays`, `minBudget`, `maxBudget`

**Selectable fields**
`user`, `startLocation`, `destination`, `startDate`, `endDate`, `travelDays`, `minBudget`, `maxBudget`, `contact`, `note`, `status`

Example:

```http
GET /travel-plans?destination=Thailand&status=open&page=1&limit=10&sort=startDate&fields=startLocation,destination,startDate,travelDays
```

---

## TravelRequest

(GET `travel-plans/:planId/travel-requests`)

**Searchable fields**
`requestNote`

**Filterable fields**
`status`

**Sortable fields**
`createdAt`, `updatedAt`

**Selectable fields**
`requester`, `requestNote`, `status`, `createdAt`, `updatedAt`

Example:

```http
GET /travel-requests?status=pending&page=1&limit=10&sort=-createdAt&fields=requester,status,createdAt
```


## Payments

(GET `/payments`)

**Searchable fields**
`transactionId`, `email`, `username`

**Filterable fields**
`user`, `email`, `status`, `subscriptionType`, `paymentProvider`, `paymentDate`

**Sortable fields**
`paymentDate`, `amount`, `expiresAt`, `createdAt`

**Selectable fields**
`user`, `username`, `email`, `amount`, `paymentDate`, `expiresAt`, `status`, `subscriptionType`, `paymentProvider`

Example:

```http
GET /payments?search=txn123&status=success&page=1&limit=10&sort=-paymentDate&fields=username,email,amount,status
```
