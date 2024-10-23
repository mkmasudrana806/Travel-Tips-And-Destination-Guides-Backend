# Travel Tips And Destination Guides

## Important Links

1. **Client Live Deployment Link :**

- [Live Client](https://travel-tips-and-destination-guides-client.vercel.app/)
  
1. **Server Live Deployment Link :**

- [Live Server](https://travel-tips-and-destination-guides-backend.vercel.app)

2. **GitHub Repository Link :**

- [Client](https://github.com/mkmasudrana806/Travel-Tips-AndDestination-Guides-Client)

- [Server](https://github.com/mkmasudrana806/Travel-Tips-And-Destination-Guides-Backend)

 
## Overview

The Car Washing System project is a backend application designed to manage various entities and processes related to a car washing business, using a well-structured REST API. The project provides comprehensive functionality for managing different user types, authorization, services, and operations within the system.

The main focus of this assignment is to implement modules pattern, QueryBuilder, Error Handling, CRUD operations, Authentication & Authorization, Transaction & Rollback etc.

## Features

- **User Management:** Create, update, and delete user accounts with role-based access control.
- **Authentication:** Secure user authentication using JWT for login, registration, and token management.
- **Service Management:** Define and manage car washing services with detailed descriptions, pricing, and availability.
- **Slot Management:** Manage time slots for services, allowing users to book specific times.
- **Booking Management:** Enable users to book services at available time slots and manage these bookings.
- **Reviews Management:** Enable users to review services and rate services, also edit and delete review

## API’s Endpoints

### Auth:

- **POST** `/auth/signup` - Sign up a new user.
- **POST** `/auth/login` - Log in a user.
- **POST** `/auth/change-password` - Change a user's password.

### User:

- **GET** `/users` - Retrieve all users.
- **GET** `/users/:id` - Retrieve a user by ID.
- **DELETE** `/users/:id` - Delete a user by ID.
- **PUT** `/users/:id` - Update a user by ID.
- **PATCH** `/toggle-user-role/:id` - Toggle user role
- ** PATCH** `/toggle-user-status/:id` - Toggle user status

### Service:

- **POST** `/services/create-service` - Create a new service.
- **GET** `/services` - Retrieve all services.
- **GET** `/services/:id` - Retrieve a service by ID.
- **DELETE** `/services/:id` - Delete a service by ID.
- **PUT** `/services/:id` - Update a service by ID.
- **POST** `/services/slots` - Create time slots for a service.

### Slot:

- **POST** `/slots/create-slot` - Create a new slot.
- **GET** `/slots` - Retrieve all slots.
- **GET** `/slots/availability` - Check slot availability.
- **GET** `/slots/:id` - Retrieve a slot by ID.
- **DELETE** `/slots/:id` - Delete a slot by ID.
- **PATCH** `/toggle-slot-status/:id` - Toggle slot status available to cancel

### Booking:

- **POST** `/bookings/create-booking` - Create a new booking.
- **GET** `/bookings` - Retrieve all bookings.
- **GET** `/bookings/:id` - Retrieve a booking by ID.
- **DELETE** `/bookings/:id` - Delete a booking by ID.
- **PUT** `/bookings/:id` - Update a booking by ID.
- **GET** `/my-bookings` - Retrieve bookings for the logged-in user.


### Review:

- **POST** `/create-review` - Create a new review.
- **GET** `/reviews/` - Retrieve all reviews.
- **GET** `/reviews/:id` - Retrieve a review by ID.
- **DELETE** `/reviews/:id` - Delete a review by ID.
- **PUT** `/reviews/:id` - Update a review by ID.
  
## Installation

To get the project up and running locally, follow these steps:

`Note:` before running the application, please include .env file root of your project. below is given instructions of it.

1. **Clone the repository:**

```bash
git clone https://github.com/mkmasudrana806/car-washing-system-backend.git
cd car-washing-system-backend
```

2. **Install Dependencies:**

```bash
npm install
```

3. **Build the project:**

```bash
tsc
```

4. **Start the development server:**

```bash
npm start
```

## Environment Variables

Create a .env file in the root of the project and add your variables:

```bash
PORT= 5000
DATABASE_URL= # your database connection url
# bcrypt salt rounds
BCRYPT_SALT_ROUNDS=10
NODE_ENV=production
# JWT information
JWT_ACCESS_SECRET=f15bbb7cf8500d6c759ddfd6214a4b771343d70de56859554a0aad81f0fcce56
JWT_ACCESS_EXPIRES_IN=1d
```

## Usage

### Auth Routes

- **POST** `/auth/signup` - Sign up a new user.

**Request Body:**

```json
{
  "name": "Programming Hero",
  "email": "web@programming-hero.com",
  "password": "ph-password",
  "phone": "1234567890",
  "role": "admin", //role can be user or admin
  "address": "123 Main Street, City, Country"
}
```

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User registered successfully",
  "data": {
    "_id": "60629b8e8cfcd926384b6e5e",
    "name": "Programming Hero",
    "email": "web@programming-hero.com",
    "phone": "1234567890",
    "role": "admin",
    "address": "123 Main Street, City, Country",
    "createdAt": "2024-06-15T12:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

###

- **POST** `/auth/login` - Log in a user.

**Request Body:**

```json
{
  "email": "web@programming-hero.com",
  "password": "ph-password"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDYyOWI4ZThjZmNkOTI2Mzg0YjZlNWUiLCJuYW1lIjoiUHJvZ3JhbW1pbmcgSGVyb3MiLCJlbWFpbCI6IndlYkBwcm9ncmFtbWluZy1oZXJvLmNvbSIsInBob25lIjoiMTIzNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiIsImFkZHJlc3MiOiIxMjMgTWFpbiBTdHJlZXQsIENpdHksIENvdW50cnkiLCJpYXQiOjE2MjQ1MTY2MTksImV4cCI6MTYyNDUyMDYxOX0.kWrEphO6lE9P5tvzrNBwx0sNogNuXpdyG-YoN9fB1W8",
  "data": {
    "_id": "60629b8e8cfcd926384b6e5e",
    "name": "Programming Hero",
    "email": "web@programming-hero.com",
    "phone": "1234567890",
    "role": "admin",
    "address": "123 Main Street, City, Country",
    "createdAt": "2024-06-15T12:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

###

- **POST** `/auth/change-password` - Change a user's password.

**Request Body:**

```json
{
  "oldPassword": "soton",
  "newPassword": "nondini"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User password is changed successfully",
  "data": {
    "_id": "66bf1f13e8d3e594624b81c1",
    "name": "soton",
    "email": "soton@gmail.com",
    "needsPasswordChange": false,
    "phone": "01745678910",
    "role": "user",
    "address": "Narayanganj, Dhaka, Bangladesh 2.0",
    "isDeleted": false,
    "createdAt": "2024-08-16T09:42:43.747Z",
    "updatedAt": "2024-08-16T09:43:29.216Z",
    "__v": 0,
    "passwordChangedAt": "2024-08-16T09:43:29.216Z"
  }
}
```

###

### User Routes:

- **GET** `/users` - Retrieve all users.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All users are retrived successfully",
  "data": [
    {
      "_id": "66bf1f13e8d3e594624b81c1",
      "name": "soton",
      "email": "soton@gmail.com",
      "needsPasswordChange": false,
      "phone": "01745678910",
      "role": "user",
      "address": "Narayanganj, Dhaka, Bangladesh 2.0",
      "isDeleted": false,
      "createdAt": "2024-08-16T09:42:43.747Z",
      "updatedAt": "2024-08-16T09:43:29.216Z",
      "passwordChangedAt": "2024-08-16T09:43:29.216Z"
    },
    {
      "_id": "66bddb88063242aa8e5c6fc5",
      "name": "Rana",
      "email": "rana@gmail.com",
      "needsPasswordChange": true,
      "phone": "01745678910",
      "role": "user",
      "address": "Sirajganj, Rajshahi, Bangladesh 2.0",
      "isDeleted": false,
      "createdAt": "2024-08-15T10:42:16.351Z",
      "updatedAt": "2024-08-15T10:46:22.650Z"
    }
    ... and so on
  ]
}
```

- **GET** `/users/:id` - Retrieve a user by ID.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User is retrived successfully",
  "data": {
    "_id": "66bf1f13e8d3e594624b81c1",
    "name": "soton",
    "email": "soton@gmail.com",
    "needsPasswordChange": false,
    "phone": "01745678910",
    "role": "user",
    "address": "Narayanganj, Dhaka, Bangladesh 2.0",
    "isDeleted": false,
    "createdAt": "2024-08-16T09:42:43.747Z",
    "updatedAt": "2024-08-16T09:43:29.216Z",
    "__v": 0,
    "passwordChangedAt": "2024-08-16T09:43:29.216Z"
  }
}
```

- **DELETE** `/users/:id` - Delete a user by ID.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User is deleted successfully",
  "data": {
    "_id": "66bf1f13e8d3e594624b81c1",
    "name": "soton",
    "email": "soton@gmail.com",
    "needsPasswordChange": false,
    "phone": "01745678910",
    "role": "user",
    "address": "Narayanganj, Dhaka, Bangladesh 2.0",
    "isDeleted": true,
    "createdAt": "2024-08-16T09:42:43.747Z",
    "updatedAt": "2024-08-16T09:51:36.088Z",
    "__v": 0,
    "passwordChangedAt": "2024-08-16T09:43:29.216Z"
  }
}
```

- **PUT** `/users/:id` - Update a user by ID.

**Request Body:**

```json
{
  "address": "Sirajganj, Rajshahi, Bangladesh 2.0"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User is updated successfully",
  "data": {
    "_id": "66bf1f13e8d3e594624b81c1",
    "name": "soton",
    "email": "soton@gmail.com",
    "needsPasswordChange": false,
    "phone": "01745678910",
    "role": "user",
    "address": "Sirajganj, Rajshahi, Bangladesh 2.0",
    "isDeleted": false,
    "createdAt": "2024-08-16T09:42:43.747Z",
    "updatedAt": "2024-08-16T10:02:25.500Z",
    "__v": 0,
    "passwordChangedAt": "2024-08-16T09:43:29.216Z"
  }
}
```

### Service Routes

- **POST** `/services/create-service` - Create a new service.

**Request Headers:**

```javascript
Authorization:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmF
tZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

You must include "Bearer" at the beginning of the token!
```

**Request Body:**

```json
{
  "name": "Car Wash",
  "description": "Professional car washing service",
  "price": 50,
  "duration": 60, // Duration in minutes
  "isDeleted": false
}
```

**Response Body:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Service created successfully",
  "data": {
    "_id": "60d9c4e4f3b4b544b8b8d1c5",
    "name": "Car Wash",
    "description": "Professional car washing service",
    "price": 50,
    "duration": 60,
    "isDeleted": false,
    "createdAt": "2024-06-15T12:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

- **GET** `/services` - Retrieve all services.

- **GET** `/services/:id` - Retrieve a service by ID.

- **DELETE** `/services/:id` - Delete a service by ID.

- **PUT** `/services/:id` - Update a service by ID.

**Request Headers:**

```javascript
Authorization:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmF
tZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

You must include "Bearer" at the beginning of the token!
```

**Request Body:**

```json
{
  "price": 700 // You can include any attribute(s) of the service collection that you want to update, one or more.
}
```

**Response Body:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Service updated successfully",
  "data": {
    "_id": "60d9c4e4f3b4b544b8b8d1c5",
    "name": "Car Wash",
    "description": "Professional car washing service",
    "price": 700,
    "duration": 60,
    "isDeleted": false,
    "createdAt": "2024-06-15T12:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

- **POST** `/services/slots` - Create time slots for a service.

**Request Headers:**

```javascript
Authorization:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmF
tZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

You must include "Bearer" at the beginning of the token!
```

**Request Body:**

```json
{
  "service": "60d9c4e4f3b4b544b8b8d1c5",
  "date": "2024-06-15",
  "startTime": "09:00",
  "endTime": "14:00"
}
```

**Response Body:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Slots created successfully",
  "data": [
    {
      "_id": "60d9c4e4f3b4b544b8b8d1c6",
      "service": "60d9c4e4f3b4b544b8b8d1c5",
      "date": "2024-06-15",
      "startTime": "09:00",
      "endTime": "10:00", //look at the starting point
      "isBooked": "available",
      "createdAt": "2024-06-15T12:00:00Z",
      "updatedAt": "2024-06-15T12:00:00Z"
    },
    {
      "_id": "60d9c4e4f3b4b544b8b8d1c7",
      "service": "60d9c4e4f3b4b544b8b8d1c5",
      "date": "2024-06-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "isBooked": "available",
      "createdAt": "2024-06-15T12:00:00Z",
      "updatedAt": "2024-06-15T12:00:00Z"
    },
    {
      "_id": "60d9c4e4f3b4b544b8b8d1c7",
      "service": "60d9c4e4f3b4b544b8b8d1c5",
      "date": "2024-06-15",
      "startTime": "11:00",
      "endTime": "12:00",
      "isBooked": "available",
      "createdAt": "2024-06-15T12:00:00Z",
      "updatedAt": "2024-06-15T12:00:00Z"
    },
    ... and so on based on service duration
  ]
}
```

### Slot Routes:

- **GET** `/slots` - Retrieve all slots.

- **GET** `/slots/availability` - Check slot availability.

**Query Parameters:**

- `date`: (Optional) The specific date for which available slots are requested (format: YYYY-MM-DD).
- `serviceId`: (Optional) ID of the service for which available slots are requested.

**Request Example:**

```plain
  GET /api/slots/availability?date=2024-06-15&serviceId=60d9c4e4f3b4b544b8b8d1c5
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Available slots retrieved successfully",
  "data": [
    {
      "_id": "60d9c4e4f3b4b544b8b8d1c6",
      "service": {
        "_id": "60d9c4e4f3b4b544b8b8d1c5",
        "name": "Car Wash",
        "description": "Professional car washing service",
        "price": 700,
        "duration": 60,
        "isDeleted": false,
        "createdAt": "2024-06-15T12:00:00Z",
        "updatedAt": "2024-06-15T12:00:00Z"
      },
      "date": "2024-06-15",
      "startTime": "09:00",
      "endTime": "10:00",
      "isBooked": "available",
      "createdAt": "2024-06-15T12:00:00Z",
      "updatedAt": "2024-06-15T12:00:00Z"
    },
    {
      "_id": "60d9c4e4f3b4b544b8b8d1c9",
      "service": {
        "_id": "60d9c4e4f3b4b544b8b8d1c5",
        "name": "Car Wash",
        "description": "Professional car washing service",
        "price": 700,
        "duration": 60,
        "isDeleted": false,
        "createdAt": "2024-06-15T12:00:00Z",
        "updatedAt": "2024-06-15T12:00:00Z"
      },
      "date": "2024-06-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "isBooked": "canceled",
      "createdAt": "2024-06-15T12:00:00Z",
      "updatedAt": "2024-06-15T12:00:00Z"
    }
  ]
}
```

- **GET** `/slots/:id` - Retrieve a slot by ID.

- **DELETE** `/slots/:id` - Delete a slot by ID.

### Booking:

- **POST** `/bookings/create-booking` - Create a new booking.

**Request Headers:**

```javascript
Authorization:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmF
tZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

You must include "Bearer" at the beginning of the token!
```

**Request Body:**

```json
{
  "serviceId": "60d9c4e4f3b4b544b8b8d1c5",
  "slotId": "60d9c4e4f3b4b544b8b8d1c6",
  "vehicleType": "car",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Camry",
  "manufacturingYear": 2020,
  "registrationPlate": "ABC123"
}
```

**Response Body:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking successful",
  "data": {
    "_id": "60d9c4e4f3b4b544b8b8d1c7",
    "customer": {
      "_id": "123456789012345678901234",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "1234567890",
      "address": "123 Main Street, City, Country"
    },
    "service": {
      "_id": "60d9c4e4f3b4b544b8b8d1c5",
      "name": "Car Wash",
      "description": "Exterior and interior car cleaning",
      "price": 50,
      "duration": 30,
      "isDeleted": false
    },
    "slot": {
      "_id": "60d9c4e4f3b4b544b8b8d1c6",
      "service": "60d9c4e4f3b4b544b8b8d1c5",
      "date": "2024-06-15",
      "startTime": "09:00",
      "endTime": "10:00",
      "isBooked": "booked" // Updated to "booked"
    },
    "vehicleType": "car",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Camry",
    "manufacturingYear": 2020,
    "registrationPlate": "ABC123",
    "createdAt": "2024-06-15T12:00:00Z", // For this, ensure that your model includes the option to enable timestamps
    "updatedAt": "2024-06-15T12:00:00Z" // For this, ensure that your model includes the option to enable timestamps
  }
}
```

- **GET** `/bookings` - Retrieve all bookings.

- **GET** `/bookings/:id` - Retrieve a booking by ID.

- **DELETE** `/bookings/:id` - Delete a booking by ID.

- **PUT** `/bookings/:id` - Update a booking by ID.

- **GET** `/my-bookings` - Retrieve bookings for the logged-in user.

**Request Headers:**

```javascript
Authorization:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmF
tZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

You must include "Bearer" at the beginning of the token!
```

**Request Body:**

```json
{
  "serviceId": "60d9c4e4f3b4b544b8b8d1c5",
  "slotId": "60d9c4e4f3b4b544b8b8d1c6",
  "vehicleType": "car",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Camry",
  "manufacturingYear": 2020,
  "registrationPlate": "ABC123"
}
```

**Response Body:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking successful",
  "data": {
    "_id": "60d9c4e4f3b4b544b8b8d1c7",
    "customer": {
      "_id": "123456789012345678901234",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "1234567890",
      "address": "123 Main Street, City, Country"
    },
    "service": {
      "_id": "60d9c4e4f3b4b544b8b8d1c5",
      "name": "Car Wash",
      "description": "Exterior and interior car cleaning",
      "price": 50,
      "duration": 30,
      "isDeleted": false
    },
    "slot": {
      "_id": "60d9c4e4f3b4b544b8b8d1c6",
      "service": "60d9c4e4f3b4b544b8b8d1c5",
      "date": "2024-06-15",
      "startTime": "09:00",
      "endTime": "10:00",
      "isBooked": "booked" // Updated to "booked"
    },
    "vehicleType": "car",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Camry",
    "manufacturingYear": 2020,
    "registrationPlate": "ABC123",
    "createdAt": "2024-06-15T12:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

## Technology Stack:

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod Validation
- bcrypt
- Stripe
- Cloudinar
- Nodemailer
- Multer

## Project Structure

**builders/** a query builder class including some methods like search, filter, limit, pagination, fileds limiting

**errors/** all errors handler methods like CastError, duplicate entry error, zod errors, mongoose validation error

**interface/** contains error.ts file, which contains error types and index.ts contains Request interface

**middlewares/** auth, globalErrorHandler, notFound, validateRequest middlewares

**modules/** contains all models like user, auth, service, slot, booking and review. each module contains routes, controller, service, validation, constants, model and utils files

**routes/** Centralized route management for the API.

**utils/** Utility functions and helpers like appError, catchAsync, sendResponse.

**app.ts** The main entry point of the application.

**server.ts** Application database connection and server configuration

## Data Modeling

### User Model

- `name`: Full name of the user.
- `email`: email address used for communication and login.
- `password`: Securely hashed password for authentication.
- `phone`: Contact phone number for notifications and updates.
- `role`**:** The role of the user, which can be one of the following: `admin`, `user`.
- `address`: Complete physical address for service delivery or correspondence.

### Service Model

- `name`: Title of the service.
- `description`: Brief description of what the service entails.
- `price`: Cost of the service in the local currency.
- `duration`**:** Duration of the service in minutes.
- `isDeleted`: Indicates whether the service is marked as deleted (false means it is not deleted).

### Slot Model

- `service`: Reference to the specific service being booked.
- `date`: Date of the booking.
- `startTime`: Start time of the slot.
- `endTime`: Approximate end time of the slot.
- `isBooked`: Status of the slot (available, booked, canceled).

### Booking Model

- `customer`: Reference to the user who made the booking.
- `service`: Reference to the booked service.
- `slot`: Reference to the booking slot.
- `vehicleType`: Type of the vehicle (enum: `car`, `truck`, `SUV`, `van`, `motorcycle`, `bus`, `electricVehicle`, `hybridVehicle`, `bicycle`, `tractor`).
- `vehicleBrand`: Brand or manufacturer of the vehicle.
- `vehicleModel`: Model or variant of the vehicle.
- `manufacturingYear`: Manufacturing year of the vehicle.
- `registrationPlate`: Unique registration number assigned to the vehicle.

## Error Handling:

### **1\. No Data Found:**

When retrieving data, if the database collection is empty or no matching data is found, return the message: "No data found."

```elixir
{
  "success": false,
  "statusCode": 404,
  "message": "No Data Found",
  "data":[]
}
```

### **2. Error Handling:**

Implement proper error handling throughout the application. Use global error handling `middleware` to catch and handle errors, providing appropriate error responses with error messages.

**Error Response Object Should include the following properties:**

- success → false
- message → Error Type → Validation Error, Cast Error, Duplicate Entry
- errorMessages
- stack

**Sample Error Response**

```swift
   {
    "success": false,
    "message": "E11000 duplicate key error collection: univerity-management.students index: email_1 dup key: { email: \\"user2@gmail.com\\" }",
    "errorMessages": [
        {
            "path": "",
            "message": "E11000 duplicate key error collection: univerity-management.students index: email_1 dup key: { email: \\"user2@gmail.com\\" }"
        }
    ],
    "stack": "MongoServerError: E11000 duplicate key error collection: univerity-management.students index: email_1 dup key: { email: \\"user2@gmail.com\\" }\\n    at H:\\\\next-level-development\\\\university-management-auth-service\\\\node_modules\\\\mongodb\\\\src\\\\operations\\\\insert.ts:85:25\\n    at H:\\\\next-level-development\\\\university-management-auth-service\\\\node_modules\\\\mongodb\\\\src\\\\cmap\\\\connection_pool.ts:574:11\\n    at H:\\\\next-level-development\\\\university-writeOrBuffer (node:internal/streams/writable:391:12)"
}
```

### **3\. Not Found Route:**

Implement a global "Not Found" handler for unmatched routes. When a route is not found, respond with a generic message: "Not Found.”

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Not Found"
}
```

### **4\. Authentication Middleware:**

Implement an Authentication Middleware to authenticate your application. Ensures that only user and admin can access their own accessible routes.

```json
{
  "success": false,
  "statusCode": 401,
  "message": "You have no access to this route"
}
```

### **5\. Zod Validation:**

The API employs Zod for input validation, ensuring data consistency. When validation fails, a 400 Bad Request status code is returned, accompanied by detailed error messages specifying the erroneous fields and reasons.

---

###
