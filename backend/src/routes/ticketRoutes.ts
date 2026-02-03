import { Router } from "express";
import * as ticketController from "../controllers/ticketController";
import { validateRequest } from "../middleware/validateRequest";
import {
  createTicketSchema,
  updateTicketSchema,
  ticketIdParamSchema,
  listTicketsQuerySchema,
  createCommentSchema,
  listCommentsQuerySchema,
} from "../validation/schemas";

const router = Router();

router.get(
  "/",
  validateRequest(listTicketsQuerySchema),
  ticketController.listTickets,
);
router.post(
  "/",
  validateRequest(createTicketSchema),
  ticketController.createTicket,
);
router.get(
  "/:id",
  validateRequest(ticketIdParamSchema),
  ticketController.getTicket,
);
router.patch(
  "/:id",
  validateRequest(updateTicketSchema),
  ticketController.updateTicket,
);
router.delete(
  "/:id",
  validateRequest(ticketIdParamSchema),
  ticketController.deleteTicket,
);

router.get(
  "/:id/comments",
  validateRequest(listCommentsQuerySchema),
  ticketController.listComments,
);
router.post(
  "/:id/comments",
  validateRequest(createCommentSchema),
  ticketController.addComment,
);

export default router;
