# Trending Content

Platform for researching trending content, running campaigns, and generating insights from Reddit and YouTube using AI.

## Stack

- **Frontend:** Next.js, React, MUI (`front/`)
- **Backend:** Node.js, Express, MongoDB (`server/`)
- **AI:** OpenAI / ChatGPT integrations
- **CI:** Bitbucket Pipelines (deploy via SSH + PM2)

## Project structure

```
front/     Next.js web app
server/    Express API + MongoDB models
```

## Prerequisites

- Node.js 16.x or 18.x
- MongoDB
- npm or yarn

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create env files locally (not committed):

- `server/.env.dev`
- `server/.env.prod`

```bash
npm run start:dev   # dev — port 5001
npm run start       # prod — port 5000
```

### 2. Frontend

```bash
cd front
npm install
```

Create env files locally (not committed):

- `front/.env.dev`
- `front/.env.prod`

```bash
npm run dev         # dev — port 3031
npm run build       # production build
npm start           # production — port 3000
```

## Features

- Campaign management and content search
- Reddit and YouTube thread ingestion
- ChatGPT-powered content tools
- User auth, subscriptions, and admin settings
- Prompt and project management

## Notes

- `.env*` files and `node_modules/` are gitignored — add your own secrets locally
- `graphify-out/` is local tooling output and is not part of the app

## Repo

https://github.com/shanzanemat846-alta/trending_content
