import { Router } from "express";
import {
  createTicket,
  getMyTicket,
  getMyTicketMessages,
  getMyTickets,
  postCustomerMessage,
} from "../controllers/ticketController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate, authorize("customer"));
router.post("/", createTicket);
router.get("/my", getMyTickets);
router.get("/:ticketId", getMyTicket);
router.get("/:ticketId/messages", getMyTicketMessages);
router.post("/:ticketId/messages", postCustomerMessage);

export default router;
