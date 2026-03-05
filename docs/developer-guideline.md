# Developer Guidelines

### Purpose

This document explains how the project is structured and how developers should extend or modify it.

The goal is to maintain consistency, separation of concerns, and scalability.

# High-Level Request Flow

```
Route → Controller → Service → Model → Database
```

- Routes define endpoints and attach middleware.
- Controllers handle HTTP logic.
- Services implement business logic.
- Models define database schemas.
- Middleware handles cross-cutting concerns.

Business logic should never exist inside controllers or routes.

# Folder Responsibilities

### modules/

Each feature has its own module.

Structure:

```
module/
 ├── controller
 ├── service
 ├── model
 ├── route
 ├── validation
 ├── interface
```

#### controller

- Handles request/response
- Extracts params
- Calls service methods
- Sends standardized response

No database queries here.

#### service

- Contains business logic and validation
- Interacts with models
- Handles relationships

All core logic must live here.

#### model

- Defines schema
- Defines indexes
- Defines references
- Mongoose middleware (if required)

#### validation

- Zod schemas
- Request payload validation
- Should be used in route layer before controller

#### interface

- Type definitions
- Used to ensure consistency across service and model layers

## middlewares/

Contains:

- auuth
- optionalAuth
- errorHandler
- request validation middleware

New middleware should be placed here.

Middleware must not contain business logic.

## config/

Contains:

- Environment configuration
- Third-party integration setup

Do not hardcode configuration values inside services.

## utils/

Reusable helper functions.

Should be:

- Stateless
- Generic
- Independent of specific modules

## errors/

Custom error classes.

All thrown errors should be standardized.

Avoid throwing raw strings.

## queryBuilder/

Reusable query abstraction for filtering and pagination.

Use this instead of rewriting filtering logic inside services.

# Adding a New Feature

To add a new feature:

1. Create a new folder inside `modules/`.
2. Define:
   - Model
   - Service
   - Controller
   - Route
   - Validation

3. Register this route inside central route loader at path `/src/app/routes/index.ts`.
4. Apply proper authentication middleware and payload validation.
5. Follow standardized response structure.

# Modifying Existing Logic

- Business logic → modify inside service.
- Request structure → update validation schema.
- Response structure → adjust `sendResponse.ts` in utils and mapping in controller with new structure.
- Database structure → update model and indexes carefully.

Never bypass service layer from controller.

# Authentication Rules

- Use `auth` for protected routes.
- Use `optionalAuth` for public but personalized routes.
- Authorization checks must occur inside service layer.

# Comment System Rules

- Never embed replies inside comments.
- Always use parentComment reference.
- Do not implement recursive population.
- Use lazy loading strategy for replies.

# Design Principles Should Follow

- Keep controllers thin.
- Keep services deterministic.
- Avoid cross-module direct dependency.
- Favor reference-based relationships.
- Limit nested depth for hierarchical data.

# Summary

This project prioritizes:

- Clear module boundaries
- Predictable data flow
- Controlled database access
- Context-aware responses
- Scalable retrieval strategies

Developers should follow these conventions when extending the system.
