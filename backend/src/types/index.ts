import type { TicketStatus, TicketPriority } from "@prisma/client";

export type { TicketStatus, TicketPriority };

export interface TicketsListQuery {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  sort?: "createdAt_asc" | "createdAt_desc";
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
