# Architecture: Mini Support Desk

This document describes the architecture of the Mini Support Desk project: how the system is structured, how data flows, and which design decisions and trade-offs were made. It is written for reviewers and future maintainers.

---

## 1. High-level system overview

Mini Support Desk is a two-tier full-stack application:

- **Frontend**: A single-page application (SPA) built with React and TypeScript, served by Vite in development and as static assets in production. It communicates with the backend over HTTP using JSON. Server state is managed by React Query; there is no Redux or global client store for server data.
- **Backend**: An Express HTTP API that exposes REST endpoints for tickets and comments. It uses PostgreSQL as the database and Prisma as the ORM. All incoming requests that carry body, params, or query are validated with Zod before reaching business logic.
- **Data**: PostgreSQL stores two main entities: **tickets** (with soft delete via `deletedAt`) and **comments** (linked to tickets; cascade delete only on hard delete of a ticket, which this app does not perform—tickets are only soft-deleted).

```
[Browser] → [React SPA] --HTTP/JSON--> [Express API] → [Prisma] → [PostgreSQL]
```

The backend does not implement authentication, authorization, or real-time features. Comment authors are identified by a free-text name only.

---

## 2. Frontend → Backend interaction flow

1. **User action**: The user interacts with the UI (e.g. opens the ticket list, submits the create-ticket form, adds a comment).
2. **React Query**: The relevant component uses `useQuery` (for reads) or `useMutation` (for writes). The query/mutation calls a function from `src/api/tickets.ts` (e.g. `fetchTickets`, `createTicket`, `createComment`). API logic is intentionally kept in `api/` and not inside UI components.
3. **HTTP client**: Each API function uses a shared `apiRequest()` helper in `src/api/client.ts`. This helper:
   - Prepends the base URL (`/api` in dev via Vite proxy, or `VITE_API_URL` when set),
   - Sets `Content-Type: application/json`,
   - Sends the request and parses the response as JSON,
   - Throws an `Error` with the server’s error message when the response is not 2xx.
4. **Backend**: The request hits a semantic route (e.g. `GET /tickets`, `POST /tickets/:id/comments`). The route runs validation middleware (Zod), then the controller, then the service, then the repository. The response is JSON (except 204 for delete).
5. **UI update**: React Query caches the result, invalidates related queries on mutations (e.g. after adding a comment, the comments list is invalidated), and components re-render. Loading, error, and empty states are handled in the UI using React Query’s `isLoading`, `isError`, `error`, and `data`.

There is no global client state for server data beyond React Query’s cache. Form state (e.g. search term, filters, form fields) is local component state (`useState`).

---

## 3. Backend layering rationale

The backend is structured in four layers. Each layer has a single responsibility and does not leak concerns from other layers.

- **Routes** (`src/routes/ticketRoutes.ts`): Define HTTP method and path, attach validation middleware (Zod schema), and delegate to a controller function. No business logic, no database access, no error handling logic beyond “call controller.”
- **Controllers** (`src/controllers/ticketController.ts`): Extract data from the request (params, query, body—already validated and normalized by middleware), call exactly one service method, and send the HTTP response (status code + JSON). Controllers do not access the database, do not throw business errors (they receive errors from services and rely on the global error handler), and do not contain validation logic.
- **Services** (`src/services/ticketService.ts`): Implement use cases (e.g. “list tickets,” “create ticket,” “add comment”). They call repositories, enforce rules such as “ticket must exist before adding a comment,” and throw `AppError` (e.g. 404 “Ticket not found”) for the error handler to translate to HTTP status and JSON. Services do not know about HTTP, request/response, or validation libraries.
- **Repositories** (`src/repositories/ticketRepository.ts`, `commentRepository.ts`): Perform all Prisma (database) operations. They accept and return domain-shaped data and pagination parameters. They do not throw HTTP-specific errors; they may throw Prisma errors, which the global error handler turns into 500 and a generic message.

Validation is centralized in middleware: every route that accepts body, params, or query uses a Zod schema. On success, the middleware replaces `request.body`, `request.params`, or `request.query` with the parsed result so controllers receive typed, validated data. On failure, the middleware throws a validation error that the global error handler maps to 422 and a structured body (`message`, `code`, `details`).

This layering keeps the API easy to reason about and test: routes are thin, controllers are thin, services hold business rules, and repositories hold data access. No overlapping responsibilities.

---

## 4. Data modeling decisions

- **Ticket**: `id` (UUID, generated by Prisma), `title`, `description`, `status` (enum: OPEN, IN_PROGRESS, RESOLVED), `priority` (enum: LOW, MEDIUM, HIGH), `createdAt`, `updatedAt`, `deletedAt` (nullable, used for soft delete). List and get-by-id both filter `deletedAt: null`. The delete endpoint sets `deletedAt = now()` and does not remove the row. This keeps history and avoids breaking referential integrity for comments.
- **Comment**: `id` (UUID), `ticketId` (foreign key to Ticket), `authorName`, `message`, `createdAt`. No `updatedAt`—comments are immutable in this spec. When a ticket is hard-deleted (not used in this app), Prisma’s `onDelete: Cascade` would remove its comments; since we only soft-delete tickets, comments remain.
- **UUIDs**: Required by the assessment. Prisma generates them with `@default(uuid())`; Zod validates them with `.uuid()`. The `uuid` npm package is not used; Prisma and Zod are sufficient.

Field lengths and enums match the assessment: title 5–80, description 20–2000, status and priority as above, comment message 1–500.

---

## 5. Scalability considerations

- **Pagination**: Every list endpoint (tickets, comments) supports `page` and `limit`. Default `limit` is 20; max is 100. The response includes `items`, `total`, `page`, `limit`, and `totalPages`. This avoids large responses and allows the frontend to implement “Previous / Next” or page numbers without loading the full dataset.
- **Search performance**: Ticket list search uses query parameter `q` and Prisma’s `contains` with `mode: "insensitive"` on title and description. This is adequate for small to medium datasets. For very large tables, the next step would be PostgreSQL full-text search or an external search index; that would require schema or infra changes and was intentionally not added here to keep the stack minimal and dependency-free.

No extra indexes are defined in the Prisma schema. For production under load, indexes on `(deletedAt, status)`, `(deletedAt, createdAt)`, and `comments(ticketId)` would be reasonable additions; left as an operational concern.

---

## 6. Reliability and error handling strategy

- **Backend**:
  - Every request that carries body, params, or query is validated with Zod in middleware. Validation failures produce 422 and a consistent JSON body: `{ success: false, error: { message, code: "VALIDATION_ERROR", details } }`.
  - Services throw `AppError` with a status code and message (e.g. 404 “Ticket not found”). The global `errorHandler` middleware catches these and sends the corresponding status and `{ success: false, error: { message, code } }`.
  - Any other thrown value is logged and returned as 500 with a generic message and no stack trace in the response.
  - No retries or circuit breakers are implemented in the backend; the frontend relies on React Query’s default retry for reads.

- **Frontend**:
  - `apiRequest()` throws on non-2xx. React Query treats that as a failed query or mutation and exposes `isError` and `error`.
  - Components render loading spinners while loading, error messages with an optional “Try again” (refetch), and empty states when the list is empty.
  - Forms (create ticket, add comment) validate on the client for immediate feedback; the server still validates and can return 422, which is shown as a submit error.

This keeps behavior predictable and errors actionable without adding extra libraries.

---

## 7. Trade-offs: what was skipped and why

- **Authentication and authorization**: Not in scope. Comment author is free text; no user accounts, JWT, or RBAC. Keeps the assessment focused on CRUD, validation, and structure.
- **Real-time updates**: No WebSockets or SSE. Users see new data by refetching (e.g. after adding a comment, React Query invalidates the comments list). Avoids extra infrastructure and complexity.
- **Rate limiting**: Not implemented. In production, this would typically live at the gateway or as Express middleware; omitted here to keep the app minimal.
- **Structured logging**: Only `console` is used. A library like Pino could be added later; not required for the assessment.
- **Automated tests**: No test files in the repo. A production codebase would add unit tests for services and validation and integration tests for routes; omitted to keep the submission self-contained and tooling-light.
- **Versioned migrations**: README uses `prisma db push` for simplicity. For production, `prisma migrate dev` and `migrate deploy` with versioned migrations are recommended; not enforced in this repo.
- **CORS**: Not configured. Correct when the frontend is same-origin or proxied; for a separate frontend origin, CORS middleware would be added in production.
- **Request IDs / tracing**: Not implemented. Helpful for debugging in production; skipped to keep the stack minimal.
- **`uuid` npm package**: Removed. UUIDs are generated by Prisma and validated by Zod; the package was redundant.

These choices keep the project small, clear, and aligned with the assessment requirements without over-engineering.
