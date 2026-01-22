# Quiz App Backend

Enterprise-grade Express.js + MongoDB backend for the Full Stack Quiz Application.

## Tech Stack
- Node.js, Express.js (TypeScript)
- MongoDB (Mongoose)
- JWT Authentication (Access + Refresh)
- RBAC (Admin/Teacher, User)
- Security: Helmet, CORS, Rate Limiting, Input Validation

## Setup
1) Copy `.env.example` to `.env` and configure values.
2) Install dependencies:
   - `npm install`
3) Run development server:
   - `npm run dev`

## OAuth Setup (Google, Facebook, LinkedIn)
Set these in `.env`:
- `FRONTEND_URL` (e.g. http://localhost:3000)
- `OAUTH_REDIRECT_BASE_URL` (e.g. http://localhost:5000/api/v1)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

Register redirect URLs with each provider:
- Google: `http://localhost:5000/api/v1/auth/google/callback`
- Facebook: `http://localhost:5000/api/v1/auth/facebook/callback`
- LinkedIn: `http://localhost:5000/api/v1/auth/linkedin/callback`

## Default Admin
- Email: admin@gmail.com
- Password: admin

Admin account is created automatically on first run.

## Project Structure
See `docs` and `src` for architecture details.
