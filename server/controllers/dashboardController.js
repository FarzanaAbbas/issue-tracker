import { Issue } from "../models/Issue.js";

const countBy = async (field) => {
  const groups = await Issue.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(groups.map((g) => [g._id, g.count]));
};

// GET /api/dashboard
export async function getDashboard(req, res) {
  const me = req.user._id;
  const active = { $ne: "CLOSED" };

  const [statusCounts, priorityCounts, assignedToMe, assignedToMeOpen, reportedByMe, unassigned, recent] =
    await Promise.all([
      countBy("status"),
      countBy("priority"),
      Issue.countDocuments({ assignee: me }),
      Issue.countDocuments({ assignee: me, status: active }),
      Issue.countDocuments({ reporter: me }),
      Issue.countDocuments({ assignee: null, status: active }),
      Issue.find().sort({ updatedAt: -1 }).limit(5).populate("reporter", "name email").populate("assignee", "name email"),
    ]);

  const byStatus = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0, ...statusCounts };
  const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, ...priorityCounts };

  res.json({
    total: byStatus.OPEN + byStatus.IN_PROGRESS + byStatus.CLOSED,
    byStatus,
    byPriority,
    assignedToMe,
    assignedToMeOpen,
    reportedByMe,
    unassigned,
    recent,
  });
}
