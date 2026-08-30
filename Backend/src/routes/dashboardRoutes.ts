import { Router } from "express";
import { getAgentDashboard, getCustomerDashboard } from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/customer", authenticate, authorize("customer"), getCustomerDashboard);
router.get("/agent", authenticate, authorize("agent"), getAgentDashboard);

export default router;
