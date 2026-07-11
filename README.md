# SportsMedia — Backend API

RESTful API for the SportsMedia platform: a sports news and community web application where users can post articles, comment, like, share, follow hashtags, and browse content by category.

## Features

- JWT-based authentication (register, login, token refresh)
- Post creation with image upload, hashtags, and category tagging
- Server-side search and filtering (title, description, hashtag, category, author)
- Comments with full author data returned on creation
- Like and share toggles
- Public user profiles and paginated user post feeds
- Profile management with profile picture upload
- Magic-byte MIME validation on all image uploads (JPEG / PNG only)
- Input validation: title length, hashtag count, comment length limits

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MySQL (mysql2) |
| Auth | JSON Web Tokens (jsonwebtoken) + bcrypt |
| File uploads | Multer |
| Config | dotenv |
| Dev server | nodemon |

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

## Installation

```bash
git clone https://github.com/mannoubim26/SportsMedia-Backend.git
cd SportsMedia-Backend
npm install
cp .env.example .env
```

Edit `.env` with your values (see section below).

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```
PORT=3000

# MySQL connection
DB_HOST=         # e.g. localhost
DB_USER=         # e.g. root
DB_PASSWORD=     # your MySQL password
DB_NAME=         # e.g. sports_social_db

# JWT
JWT_SECRET=      # run `make secret` to generate a secure random value
JWT_EXPIRES_IN=  # e.g. 7d

# CORS — comma-separated list of allowed frontend origins
CLIENT_ORIGIN=   # e.g. http://localhost:5173,https://your-app.vercel.app
```

## Database Setup

```bash
mysql -u root -p < database/reset.sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

`reset.sql` drops and recreates the database. `seed.sql` inserts sample data.

## Running

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server listens on `http://localhost:3000` (or the `PORT` value in `.env`).

## API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Get JWT token |
| GET | `/me` | Required | Get current user |

### Posts — `/api/posts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | List/search posts. Query params: `search`, `category_id`, `hashtag`, `author_id`, `page`, `limit` |
| GET | `/:id` | Optional | Get single post |
| POST | `/` | Required | Create post (`multipart/form-data`) |
| PUT | `/:id` | Required | Update post (owner only) |
| DELETE | `/:id` | Required | Delete post (owner only) |
| GET | `/:id/comments` | — | List comments on a post |
| POST | `/:id/comments` | Required | Add comment (max 500 chars) |
| POST | `/:id/like` | Required | Toggle like |
| POST | `/:id/share` | Required | Toggle share |

### Profile — `/api/profile`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Required | Get own profile |
| PUT | `/` | Required | Update own profile (`multipart/form-data`) |
| DELETE | `/` | Required | Delete account |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/:id/profile` | — | Public profile (name, bio, picture) |
| GET | `/:id/posts` | Optional | Paginated posts by a user |

### Categories — `/api/categories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List all categories |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Required | Upload image, returns URL |

### Comments — `/api/comments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/:id` | Required | Delete comment (owner only) |

### Exercises — `/api/exercises`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List exercises |
| POST | `/` | Required | Add exercise |

### Workouts — `/api/workouts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List workouts |
| GET | `/:slug` | — | Get workout by slug |
| POST | `/` | Required | Create workout |
| PUT | `/:postId` | Required | Update workout |
| DELETE | `/:postId` | Required | Delete workout |

## Image Upload

Send `multipart/form-data` with an `image` field for routes that accept images. Only JPEG and PNG files are accepted; the server validates magic bytes regardless of the `Content-Type` header.

## Team Members

- Person A — Frontend (React + Vite + Tailwind + Shadcn UI)
- Person B — Backend (Node.js + Express + MySQL)
