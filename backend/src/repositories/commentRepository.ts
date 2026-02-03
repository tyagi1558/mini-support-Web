import { PrismaClient } from "@prisma/client";
import type { PaginatedResult } from "../types";
import type { Comment } from "@prisma/client";

const prisma = new PrismaClient();

export async function findCommentsByTicketId(
  ticketId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<Comment>> {
  const skip = (page - 1) * limit;

  const where = { ticketId };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createComment(data: {
  ticketId: string;
  authorName: string;
  message: string;
}): Promise<Comment> {
  return prisma.comment.create({
    data,
  });
}
