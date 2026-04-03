# CodeLens AI

CodeLens AI is a Next.js application for analyzing and managing code snippets. It lets users explain code line-by-line, refactor snippets with instructions, and chat about snippets using an AI model. It includes authentication, snippet storage, tagging, and a simple free vs. pro plan limit.

## Features

- Explain code with a summary, per-line breakdown, complexity, and improvement suggestions
- Refactor code based on a natural-language instruction
- Chat with a snippet for quick questions and answers
- Save snippets with tags and search them later
- Authenticate users and enforce a free-plan snippet limit
- Support basic billing flows for upgrades and customer portal access

## Community impact

CodeLens AI helps the community by making code easier to understand, review, and share. It supports learning with clear explanations, encourages better refactoring practices, and gives teams a simple way to store and discuss snippets. This reduces onboarding time and improves collaboration across projects.

## Tech stack

- Next.js App Router
- React 19
- Prisma with Postgres
- Tailwind CSS
- Groq SDK for LLM requests

## Getting started

1. Install dependencies

   pnpm install

2. Create a local environment file

   cp .env.example .env

3. Run database migrations

   pnpm db:migrate

4. Start the dev server

   pnpm dev

The app should be available at http://localhost:3000.

## Environment variables

These are the commonly required variables. See .env for the full list used by the app.

- GROQ_API_KEY
- DATABASE_URL
- JWT_SECRET
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

## Scripts

- pnpm dev: start development server
- pnpm build: build for production
- pnpm start: run production server
- pnpm lint: run ESLint
- pnpm db:migrate: create and apply Prisma migrations
- pnpm db:push: push schema changes to the database
- pnpm db:studio: open Prisma Studio
- pnpm db:seed: seed the database

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear, focused commits
4. Open a pull request describing the change and motivation

If you plan to add a new feature, open an issue first so we can align on scope.
