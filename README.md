# Blog CRUD Application (MERN)

A responsive blog management application built with React + Vite, Node.js, Express, and MongoDB.

## Features
- Create, view, edit, and delete blog posts
- Search blogs by title, content, or author
- Filter by category
- Responsive UI
- Server-side validation and error handling
- MongoDB persistence

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## 1. Start the backend
```bash
cd server
cp .env.example .env
```
Edit `server/.env` and set `MONGODB_URI`. Then run:
```bash
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 2. Start the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## API routes
- `GET /api/blogs` — list blogs; optional `search` and `category` query parameters
- `GET /api/blogs/:id` — get one blog
- `POST /api/blogs` — create a blog
- `PUT /api/blogs/:id` — update a blog
- `DELETE /api/blogs/:id` — delete a blog
- `GET /api/categories` — list categories currently used by posts

## Deliverables checklist
- [x] CRUD functionality
- [x] Search blogs
- [x] Category filter
- [x] GitHub-ready source code
- [ ] Push this folder to your GitHub repository
- [ ] Publish a LinkedIn post with a screenshot/demo link

## Notes
This starter does not include authentication. Do not expose a MongoDB connection string in a public repository. Keep `.env` private.
