import { Issue } from "../models/Issue.js";
import { findIssues } from "../utils/issueQuery.js";

const countWhere = (match) => [{ $match: match }, { $count: "n" }];
const toMap = (groups) => Object.fromEntries(groups.map((g) => [g._id, g.n]));

// GET /api/dashboard: all counts come from one $facet aggregation (one round trip),
// fetched in parallel with the recently updated issues.
export async function getDashboard(req, res) {
  const me = req.user._id;
  const active = { $ne: "CLOSED" };

  const [[facets], recent] = await Promise.all([
    Issue.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: "$priority", n: { $sum: 1 } } }],
          assignedToMe: countWhere({ assignee: me }),
          assignedToMeOpen: countWhere({ assignee: me, status: active }),
          reportedByMe: countWhere({ reporter: me }),
          unassigned: countWhere({ assignee: null, status: active }),
        },
      },
    ]),
    findIssues({}, { sort: { updatedAt: -1 }, limit: 5 }),
  ]);

  const count = (key) => facets[key][0]?.n ?? 0;
  const byStatus = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0, ...toMap(facets.byStatus) };
  const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, ...toMap(facets.byPriority) };

  res.json({
    total: byStatus.OPEN + byStatus.IN_PROGRESS + byStatus.CLOSED,
    byStatus,
    byPriority,
    assignedToMe: count("assignedToMe"),
    assignedToMeOpen: count("assignedToMeOpen"),
    reportedByMe: count("reportedByMe"),
    unassigned: count("unassigned"),
    recent,
  });
}
