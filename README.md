# Task Management API

## Overview
This project implements a production-oriented REST API for task management using NestJS, TypeORM, PostgreSQL, JWT, and Swagger.

## Local setup
1. Copy `.env.example` to `.env` and adjust the values.
2. Ensure PostgreSQL is running and a database named `task_management` exists.
3. Install dependencies with `pnpm install`.
4. Run migrations with `pnpm run migration:run`.
5. Start the app with `pnpm run start:dev`.

## Main endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## Testing
Run the test suite with `pnpm test`.

## API docs
Open `http://localhost:3000/docs` after starting the server.
