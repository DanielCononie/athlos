# Athlos

Athlos is a full-stack health and wellness app designed to be a one-stop shop for improving daily wellbeing. The goal is to give users one place to track and better the habits that matter most: sleep, workouts, nutrition, and meditation.

The mobile app is built with Expo and React Native, while the backend is a Go API using Fiber and PostgreSQL. Authentication is JWT-based, with the mobile client storing tokens securely through Expo SecureStore.

## What It Tracks

- Sleep: review rest patterns and recovery quality.
- Workouts: log training sessions and follow progress over time.
- Nutrition: track meals, nutrients, and food habits.
- Meditation: build calmer routines and improve focus.

## Project Structure

```text
mobile/   Expo React Native app
server/   Go Fiber API
Makefile  Shared development commands
```

## Tech Stack

- Mobile: Expo, React Native, Expo Router, Expo SecureStore
- Backend: Go, Fiber
- Database: PostgreSQL
- Auth: JWT with secure mobile token storage

## Setup

Install dependencies:

```bash
make install
```

Create the server environment file:

```bash
cp server/.env.sample server/.env
```

Update `server/.env` with your local values:

```bash
DB_URL=DB_URL=postgres://username:password@host:port/database?sslmode=disable
JWT_SECRET=replace-with-at-least-32-random-characters
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://localhost:19000
```

Start the local PostgreSQL container if you are using the project’s existing container name:

```bash
make db-start
```

## Run

Run the API server and Expo app together:

```bash
make dev
```

Run them separately:

```bash
make dev-server
make dev-client
```

Run the Expo web client:

```bash
make dev-web
```

Stop the local PostgreSQL container:

```bash
make db-stop
```
