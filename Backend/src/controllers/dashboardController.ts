import type { PipelineStage, Types } from "mongoose";
import Ticket from "../models/Ticket.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const dashboard = async (match: Record<string, Types.ObjectId>) => {
  const [result] = await Ticket.aggregate<{
    total: Array<{ count: number }>;
    statuses: Array<{ _id: string; count: number }>;
    priorities: Array<{ _id: string; count: number }>;
  }>([
    { $match: match },
    {
      $facet: {
        total: [{ $count: "count" }],
        statuses: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        priorities: [
          { $project: { priority: { $ifNull: ["$finalTriage.priority", "$aiSuggestion.priority"] } } },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
      },
    },
  ] satisfies PipelineStage[]);

  const statusCounts = { New: 0, Assigned: 0, "In Progress": 0, Resolved: 0 };
  const priorityCounts = { Low: 0, Medium: 0, High: 0 };
  for (const item of result?.statuses ?? []) {
    if (item._id in statusCounts) statusCounts[item._id as keyof typeof statusCounts] = item.count;
  }
  for (const item of result?.priorities ?? []) {
    if (item._id in priorityCounts) priorityCounts[item._id as keyof typeof priorityCounts] = item.count;
  }

  return { total: result?.total[0]?.count ?? 0, statusCounts, priorityCounts };
};

const requireUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user;
};

export const getCustomerDashboard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  res.json({ success: true, data: await dashboard({ customer: user._id }) });
});

export const getAgentDashboard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  res.json({ success: true, data: await dashboard({ assignedAgent: user._id }) });
});
