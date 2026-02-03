import { TicketStatus } from "@prisma/client";
import * as ticketRepository from "../repositories/ticketRepository";
import * as commentRepository from "../repositories/commentRepository";
import { notFound } from "../errors";
import type { TicketsListQuery, PaginatedResult } from "../types";
import type { Ticket, Comment } from "@prisma/client";
import type {
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
} from "../validation/schemas";

export async function listTickets(
  query: TicketsListQuery,
): Promise<PaginatedResult<Ticket>> {
  return ticketRepository.findManyTickets(query);
}

export async function getTicketById(id: string): Promise<Ticket> {
  const ticket = await ticketRepository.findTicketById(id);
  if (!ticket) {
    throw notFound("Ticket");
  }
  return ticket;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return ticketRepository.createTicket({
    title: input.title,
    description: input.description,
    status: TicketStatus.OPEN,
    priority: input.priority,
  });
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
): Promise<Ticket> {
  const ticket = await ticketRepository.findTicketById(id);
  if (!ticket) {
    throw notFound("Ticket");
  }
  return ticketRepository.updateTicket(id, input);
}

export async function deleteTicket(id: string): Promise<void> {
  const ticket = await ticketRepository.findTicketById(id);
  if (!ticket) {
    throw notFound("Ticket");
  }
  await ticketRepository.softDeleteTicket(id);
}

export async function listComments(
  ticketId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<Comment>> {
  await getTicketById(ticketId);
  return commentRepository.findCommentsByTicketId(ticketId, page, limit);
}

export async function addComment(
  ticketId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  await getTicketById(ticketId);
  return commentRepository.createComment({
    ticketId,
    authorName: input.authorName,
    message: input.message,
  });
}
