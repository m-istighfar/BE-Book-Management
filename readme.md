# Backend API Documentation - Sanbercode Bootcamp Scholarship

## Overview

This repository contains the backend component for the Sanbercode Bootcamp Scholarship's Technical Skill Assessment. The backend is built using Express.js and provides a RESTful API for managing Books and Categories, along with user authentication.

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                       | Description                               | Requires Auth |
|--------|--------------------------------|-------------------------------------------|---------------|
| POST   | `/auth/login`                  | User login                                | No            |
| POST   | `/auth/register`               | User registration                         | No            |
| GET    | `/auth/verify-email/:token`    | Email verification                        | No            |
| POST   | `/auth/request-password-reset` | Request for password reset                | No            |
| POST   | `/auth/reset-password`         | Reset password                            | No            |

### Category Endpoints

| Method | Endpoint                | Description                         | Requires Auth |
|--------|-------------------------|-------------------------------------|---------------|
| GET    | `/categories`           | Retrieve all categories             | No            |
| GET    | `/categories/:id`       | Retrieve a specific category by ID  | No            |
| POST   | `/categories`           | Create a new category               | Yes           |
| PATCH  | `/categories/:id`       | Update a category by ID             | Yes           |
| DELETE | `/categories/:id`       | Delete a category by ID             | Yes           |
| GET    | `/categories/:id/books` | Get books in a specific category    | No            |

### Book Endpoints

| Method | Endpoint         | Description                     | Requires Auth |
|--------|------------------|---------------------------------|---------------|
| GET    | `/books`         | Retrieve all books              | No            |
| GET    | `/books/:id`     | Retrieve a specific book by ID  | No            |
| POST   | `/books`         | Create a new book               | Yes           |
| PATCH  | `/books/:id`     | Update a book by ID             | Yes           |
| DELETE | `/books/:id`     | Delete a book by ID             | Yes           |

## Getting Started

To get the server running locally :

- Clone this repo
- `npm install` to install all required dependencies
- Set up your database and environment variables according to the `.env.example`
- `npm start` to start the local server