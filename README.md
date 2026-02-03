# Mini Support Desk

A small support ticket app built for a technical assessment. You can create tickets, add comments, and update status/priority. Backend is Express + Prisma + PostgreSQL; frontend is React + Vite with React Query and Tailwind.

## Tech stack

**Backend**

- Node.js, Express
- PostgreSQL
- Prisma
- Zod

**Frontend**

- React
- TypeScript
- Vite
- React Query
- Tailwind CSS

## Features

- Create and list support tickets
- Update ticket status and priority
- Add comments to a ticket
- Pagination and basic search (title/description)
- Soft delete for tickets

## Running locally

**Backend**

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string, then:

```bash
npm run db:push
npm run db:generate
npm run db:seed
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Backend runs on port 3000, frontend on 5173. The frontend dev server proxies `/api` to the backend so you don’t need to set `VITE_API_URL` locally.

## Notes

- No authentication. Comment author is a free-text field.
- Ticket and comment IDs are UUIDs (Prisma default).
- Tickets are soft-deleted; list and get endpoints exclude them.
- See `ARCHITECTURE.md` for layering and design notes.
