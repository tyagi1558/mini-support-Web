import { z } from "zod";

const ticketStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);
const ticketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTicketSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(80, "Title must be at most 80 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters"),
    priority: ticketPriorityEnum.default("MEDIUM"),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket ID"),
  }),
  body: z.object({
    title: z.string().min(5).max(80).optional(),
    description: z.string().min(20).max(2000).optional(),
    status: ticketStatusEnum.optional(),
    priority: ticketPriorityEnum.optional(),
  }),
});

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket ID"),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: ticketStatusEnum.optional(),
    priority: ticketPriorityEnum.optional(),
    sort: z
      .enum(["createdAt_asc", "createdAt_desc"])
      .optional()
      .default("createdAt_desc"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket ID"),
  }),
  body: z.object({
    authorName: z
      .string()
      .min(1, "Author name is required")
      .max(100, "Author name must be at most 100 characters"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(500, "Message must be at most 500 characters"),
  }),
});

export const listCommentsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>["body"];
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>["body"];
export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
