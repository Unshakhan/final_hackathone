import { Router } from "express";
import {
  getAgentTicketById,
  getAgentTicketMessages,
  getAgentTickets,
  postAgentMessage,
  resolveTicket,
  updateStatus,
  updateTriage,
} from "../controllers/agentTicketController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate, authorize("agent"));
router.get("/tickets", getAgentTickets);
router.get("/tickets/:ticketId", getAgentTicketById);
router.get("/tickets/:ticketId/messages", getAgentTicketMessages);
router.patch("/tickets/:ticketId/triage", updateTriage);
router.patch("/tickets/:ticketId/status", updateStatus);
router.post("/tickets/:ticketId/messages", postAgentMessage);
router.post("/tickets/:ticketId/resolve", resolveTicket);

export default router;
