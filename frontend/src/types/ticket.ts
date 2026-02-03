export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface PaginatedTickets {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedComments {
  items: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface CreateCommentPayload {
  authorName: string;
  message: string;
}
