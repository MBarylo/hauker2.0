# Hauker — Social Network

## 📌 About

Hauker is a full-stack social network application (Twitter-style) that started as a college coursework project and grew into a production-oriented personal project. Users can create posts with media, follow each other, comment, repost, bookmark content, and manage their profile — all backed by a real database and JWT authentication.

## 🚀 Features

### Authentication

- Registration and login with username, email, and password
- JWT-based authentication
- Admin role with a dedicated admin panel

### Posts

- Create posts with text and up to 4 images/videos
- Edit and delete your own posts (including media)
- Repost any post (with original author and media preserved)
- Like / unlike posts
- Bookmark / save posts
- Copy direct post link
- Dedicated post page with comments

### Comments

- Add, edit, and delete comments
- View all comments left by a user on their profile

### Social

- Follow / unfollow other users
- Followers and following lists
- Personalized "Following" feed alongside the global feed
- User profiles with avatar, banner, bio, and editable username
- Profile tabs: Posts, Reposts, Liked, Commented, Saved (own profile only)

### Media

- Image and video uploads via Cloudinary
- Full-screen media viewer with keyboard navigation, thumbnails, and inline comments

### Admin Panel

- View and manage all users, posts, and comments
- Delete any content on the platform

### UI/UX

- Light and dark theme with smooth transitions
- Responsive layout for mobile and desktop
- Toast notifications for errors and validation messages

## 🛠 Tech Stack

### Backend

- Node.js
- NestJS
- TypeScript
- PostgreSQL with TypeORM
- JWT (`@nestjs/jwt`, `passport-jwt`)
- bcrypt for password hashing
- Multer + Cloudinary for media storage
- class-validator for DTO validation

### Frontend

- React (Vite)
- TypeScript
- React Router
- Axios
- Framer Motion
- Chakra UI

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd project
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Update the PostgreSQL connection settings in `app.module.ts` to match your database, then run:

```bash
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Users

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /users/:id/avatar`
- `POST /users/:id/banner`
- `GET /users/:id/followers`
- `GET /users/:id/following`
- `POST /users/:id/follow/:targetId`
- `GET /users/:id/bookmarks`
- `POST /users/:id/bookmarks`

### Posts

- `GET /posts`
- `GET /posts/:id`
- `POST /posts`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/repost`
- `DELETE /posts/:id/repost`
- `POST /posts/:id/like`
- `GET /posts/liked/:userId`
- `GET /posts/commented/:userId`
- `POST /posts/following-feed`

### Comments

- `GET /comments/:postId`
- `GET /comments/by-user/:userId`
- `POST /comments`
- `PATCH /comments/:id`
- `DELETE /comments/:id`

### Admin

- `GET /admin/users`
- `DELETE /admin/users/:id`
- `GET /admin/posts`
- `DELETE /admin/posts/:id`
- `GET /admin/comments`
- `DELETE /admin/comments/:id`

## 📸 Screenshots

(add interface screenshots here)

## 👨‍💻 Author

Matvii
