## Architecture Overview

### Design Philosophy

The backend is designed with modularity, separation of concerns, and scalability in mind.

Each feature is encapsulated within its own module to reduce coupling and improve maintainability.

The system follows a layered architecture pattern:

**Route** → **Controller** → **Service** → **Model**

### 1. Route Layer

- Defines API endpoints
- Attaches middlewares (e.g., auth, validation)
- Delegates request handling to controllers

Routes contain no business logic.



### 2. Controller Layer

- Handles HTTP request and structured API response
- Extracts parameters
- Calls appropriate service methods

Controllers remain thin and do not contain database logic.



### 3. Service Layer

- Contains business logic
- Coordinates between multiple models if needed

The service layer ensures domain logic remains independent of HTTP concerns.



### 4. Model Layer

- Defines MongoDB schemas using Mongoose
- Manages indexing strategy
- Enforces data structure rules
- Handles population and relationships

The database layer is abstracted behind services.



## Modular Structure

Each feature is isolated inside the `modules` directory:

Each module contains:

```
controller
service
model
route
validation
interface
```

## Authentication Strategy

The system uses JWT-based authentication.

Two middleware strategies are implemented:

### Auth

- Protects private endpoints
- Rejects unauthorized requests

### optionalAuth

- Used for public endpoints
- Attaches user context if token exists
- Enables context-aware responses

This allows endpoints to remain public while supporting personalization.

## Context-Aware Responses

Certain endpoints adjust their response depending on the authenticated user.

Examples:

- User profile includes `isFollowing`
- Post includes `isLiked` and so on

This approach avoids extra API calls from the frontend and improves performance.

## Error Handling Strategy

- Centralized error handler middleware
- Custom error classes
- Structured error response format
- Validation errors handled via Zod

This ensures consistent and predictable API responses.

## Scalability Considerations

The system avoids:

- Recursive population
- Large embedded documents
- Deep nested data fetching

Instead, it relies on:

- Reference-based modeling
- Lazy loading strategies
- Indexed relationship checks
- Controlled pagination

This ensures stable performance as data volume grows.

