import {
  PrismaClient,
  TicketStatus,
  TicketPriority,
  Prisma,
} from "@prisma/client";
import type { TicketsListQuery, PaginatedResult } from "../types";
import type { Ticket, Comment } from "@prisma/client";

const prisma = new PrismaClient();

export async function findManyTickets(
  query: TicketsListQuery,
): Promise<PaginatedResult<Ticket>> {
  const { search, status, priority, sort, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TicketWhereInput = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.TicketOrderByWithRelationInput =
    sort === "createdAt_asc" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findTicketById(id: string): Promise<Ticket | null> {
  return prisma.ticket.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createTicket(data: {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}): Promise<Ticket> {
  return prisma.ticket.create({
    data,
  });
}

export async function updateTicket(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
  }>,
): Promise<Ticket> {
  return prisma.ticket.update({
    where: { id },
    data,
  });
}

export async function softDeleteTicket(id: string): Promise<Ticket> {
  return prisma.ticket.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
