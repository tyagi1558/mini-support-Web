import type { Request, Response } from "express";
import * as ticketService from "../services/ticketService";
import type {
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
} from "../validation/schemas";

export async function listTickets(
  request: Request,
  response: Response,
): Promise<void> {
  const { q, status, priority, sort, page, limit } = request.query as Record<
    string,
    string | undefined
  >;
  const result = await ticketService.listTickets({
    search: q,
    status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | undefined,
    priority: priority as "LOW" | "MEDIUM" | "HIGH" | undefined,
    sort: (sort as "createdAt_asc" | "createdAt_desc") || "createdAt_desc",
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  response.status(200).json(result);
}

export async function getTicket(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;
  const ticket = await ticketService.getTicketById(id);
  response.status(200).json(ticket);
}

export async function createTicket(
  request: Request,
  response: Response,
): Promise<void> {
  const body = request.body as CreateTicketInput;
  const ticket = await ticketService.createTicket(body);
  response.status(201).json(ticket);
}

export async function updateTicket(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;
  const body = request.body as UpdateTicketInput;
  const ticket = await ticketService.updateTicket(id, body);
  response.status(200).json(ticket);
}

export async function deleteTicket(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;
  await ticketService.deleteTicket(id);
  response.status(204).send();
}

export async function listComments(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;
  const page = Number(request.query.page) || 1;
  const limit = Number(request.query.limit) || 20;
  const result = await ticketService.listComments(id, page, limit);
  response.status(200).json(result);
}

export async function addComment(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;
  const body = request.body as CreateCommentInput;
  const comment = await ticketService.addComment(id, body);
  response.status(201).json(comment);
}
