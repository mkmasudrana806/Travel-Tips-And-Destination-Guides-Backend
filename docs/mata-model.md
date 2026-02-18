# Data Model

This document describes the core entities of the Travel Sharing Platform database.

### Enum Definitions:

**User**: gender = `male`, `female` role = `user`, `admin` status = `active`, `blocked`

**Post**: category = `Adventure`, `Business Travel`, `Exploration`

**Payment**: status = `pending`, `completed`, `failed`
subscriptionType = `monthly`, `yearly`

**PostVote**: type = `upvote`, `downvote`

**TravelPlan**: status = `open`, `close`

**TravelRequest**: `pending`, `accepted`, `rejected`

**Notification**: type = `ravel_request`, `request_accepted`, `request_rejected`, `post_comment`, `post_upvote`, `new_follower`

## User

Represents a platform member who can create posts, travel plans, follow others, and interact with content.

| Field             | Type    | Description                         |
| ----------------- | ------- | ----------------------------------- |
| \_id (PK)         | String  | Unique identifier for the user      |
| name              | String  | Full name of the user               |
| email             | String  | Unique email address                |
| password          | String  | Hashed password                     |
| passwordChangedAt | Date    | Last password change timestamp      |
| age               | Number  | User age                            |
| gender            | Enum    | male, female                        |
| address           | String  | User address                        |
| role              | Enum    | user, admin                         |
| status            | Enum    | active, blocked                     |
| profilePicture    | String  | Profile image URL                   |
| isVerified        | Boolean | User blue badge verification status |
| premiumAccess     | Boolean | Premium subscription status         |
| followerCount     | Number  | Number of followers                 |
| followingCount    | Number  | Number of users followed            |
| createdAt         | Date    | Account creation timestamp          |
| updatedAt         | Date    | Last update timestamp               |

## Post

Stores user-generated travel content, experiences, or stories shared publicly on the platform.

| Field              | Type    | Description                               |
| ------------------ | ------- | ----------------------------------------- |
| \_id (PK)          | String  | Unique post identifier                    |
| author (FK → User) | String  | Post creator                              |
| title              | String  | Post title                                |
| content            | String  | Post content                              |
| category           | Enum    | Adventure, Business Travel, Exploration   |
| locationName       | String  | Travel location name                      |
| country            | String  | Country name                              |
| travelDays         | Number  | Duration of travel                        |
| estimatedCost      | Number  | Estimated travel cost                     |
| travelType         | Enum    | Type of travel (budget, midrange, luxury) |
| image              | String  | Cover image URL                           |
| premium            | Boolean | Premium post flag                         |
| upvoteCount        | Number  | Total upvotes                             |
| downvoteCount      | Number  | Total downvotes                           |
| isDeleted          | Boolean | Soft delete flag                          |
| createdAt          | Date    | Creation timestamp                        |
| updatedAt          | Date    | Last update timestamp                     |

## Comment

Represents user comments on posts, enabling discussion and interaction around shared content.

| Field            | Type   | Description               |
| ---------------- | ------ | ------------------------- |
| \_id (PK)        | String | Unique comment identifier |
| post (FK → Post) | String | Associated post           |
| user (FK → User) | String | Comment author            |
| comment          | String | Comment text              |
| createdAt        | Date   | Creation timestamp        |
| updatedAt        | Date   | Last update timestamp     |

## PostVote

Tracks user reactions (upvote/downvote) to posts for ranking and engagement metrics.

| Field            | Type   | Description            |
| ---------------- | ------ | ---------------------- |
| \_id (PK)        | String | Unique vote identifier |
| post (FK → Post) | String | Voted post             |
| user (FK → User) | String | Voting user            |
| type             | Enum   | upvote, downvote       |
| createdAt        | Date   | Creation timestamp     |
| updatedAt        | Date   | Last update timestamp  |

## SavedPost

Stores posts bookmarked by users for future reference or inspiration.

| Field            | Type   | Description                  |
| ---------------- | ------ | ---------------------------- |
| \_id (PK)        | String | Unique saved post identifier |
| user (FK → User) | String | User who saved the post      |
| post (FK → Post) | String | Saved post                   |
| createdAt        | Date   | Creation timestamp           |
| updatedAt        | Date   | Last update timestamp        |

## UserFollow

Represents the relationship where one user subscribes to another user’s updates.

| Field                 | Type   | Description                   |
| --------------------- | ------ | ----------------------------- |
| \_id (PK)             | String | Unique follow relationship ID |
| follower (FK → User)  | String | User who follows              |
| following (FK → User) | String | User being followed           |
| createdAt             | Date   | Creation timestamp            |
| updatedAt             | Date   | Last update timestamp         |

## TravelPlan

Represents a user-created travel itinerary including destination, dates, and budget to find matching partner.

| Field            | Type   | Description                   |
| ---------------- | ------ | ----------------------------- |
| \_id (PK)        | String | Unique travel plan identifier |
| user (FK → User) | String | Creator of the plan           |
| startLocation    | String | Starting location             |
| destination      | String | Travel destination            |
| startDate        | Date   | Travel start date             |
| endDate          | Date   | Travel end date               |
| travelDays       | Date   | Total travel days             |
| minBudget        | Number | Minimum budget                |
| maxBudget        | Number | Maximum budget                |
| status           | Enum   | open, close                   |
| createdAt        | Date   | Creation timestamp            |
| updatedAt        | Date   | Last update timestamp         |

## TravelRequest

Tracks requests from users who want to join a specific travel plan and their approval status.

| Field                        | Type   | Description                 |
| ---------------------------- | ------ | --------------------------- |
| \_id (PK)                    | String | Unique request identifier   |
| travelPlan (FK → TravelPlan) | String | Requested travel plan       |
| requester (FK → User)        | String | User who sent request       |
| requestNote                  | String | A message from requester    |
| status                       | Enum   | pending, accepted, rejected |
| createdAt                    | Date   | Creation timestamp          |
| updatedAt                    | Date   | Last update timestamp       |

## Media

Stores images or files attached to posts or travel plans.

| Field            | Type    | Description                          |
| ---------------- | ------- | ------------------------------------ |
| \_id (PK)        | String  | Unique media identifier              |
| user (FK → User) | String  | Owner of the media                   |
| url              | String  | Media file URL                       |
| isUsed           | Boolean | Whether media is attached to content |
| createdAt        | Date    | Creation timestamp                   |
| updatedAt        | Date    | Last update timestamp                |

## Payment

Records transactions made by users for premium features or services.

| Field              | Type   | Description                    |
| ------------------ | ------ | ------------------------------ |
| \_id (PK)          | String | Unique payment identifier      |
| userId (FK → User) | String | Paying user                    |
| username           | String | Username at time of payment    |
| email              | String | Email at time of payment       |
| amount             | String | Payment amount                 |
| date               | Date   | Payment date                   |
| expiresIn          | Date   | Subscription expiry date       |
| status             | Enum   | pending, completed, failed     |
| subscriptionType   | Enum   | monthly, yearly                |
| transactionId      | String | Payment gateway transaction ID |
| createdAt          | Date   | Creation timestamp             |
| updatedAt          | Date   | Last update timestamp          |

## Notification

Stores system alerts that inform users about important events like requests, comments, follows and so on.

| Field                 | Type   | Description                     |
| --------------------- | ------ | ------------------------------- |
| \_id (PK)             | String | Unique notification identifier  |
| recipient (FK → User) | String | User receiving notification     |
| sender (FK → User)    | String | User who triggered notification |
| type                  | Enum   | Notification events type        |
| resourceType          | String | Related resource type           |
| resourceId            | String | Related resource ID             |
| createdAt             | Date   | Creation timestamp              |
| updatedAt             | Date   | Last update timestamp           |
