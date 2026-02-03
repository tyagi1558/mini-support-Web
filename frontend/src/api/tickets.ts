import { apiRequest } from "./client";
import type {
  Ticket,
  Comment,
  PaginatedTickets,
  PaginatedComments,
  CreateTicketPayload,
  UpdateTicketPayload,
  CreateCommentPayload,
} from "@/types/ticket";

export interface ListTicketsParams {
  q?: string;
  status?: string;
  priority?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function fetchTickets(
  params: ListTicketsParams = {},
): Promise<PaginatedTickets> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.status) queryParams.set("status", params.status);
  if (params.priority) queryParams.set("priority", params.priority);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  const queryString = queryParams.toString();
  return apiRequest<PaginatedTickets>(
    `/tickets${queryString ? `?${queryString}` : ""}`,
  );
}

export function fetchTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`);
}

export function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTicket(
  id: string,
  payload: UpdateTicketPayload,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTicket(id: string): Promise<void> {
  return apiRequest<void>(`/tickets/${id}`, { method: "DELETE" });
}

export function fetchComments(
  ticketId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedComments> {
  return apiRequest<PaginatedComments>(
    `/tickets/${ticketId}/comments?page=${page}&limit=${limit}`,
  );
}

export function createComment(
  ticketId: string,
  payload: CreateCommentPayload,
): Promise<Comment> {
  return apiRequest<Comment>(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
