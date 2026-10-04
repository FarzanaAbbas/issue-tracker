import { Issue } from "../models/Issue.js";

const userLookup = (field) => ({
  $lookup: {
    from: "users",
    localField: field,
    foreignField: "_id",
    as: field,
    pipeline: [{ $project: { name: 1, email: 1 } }],
  },
});

const toUser = (u) => (u ? { id: String(u._id), name: u.name, email: u.email } : null);

/**
 * Fetches issues with reporter, assignee and comment count in a single
 * aggregation (one database round trip) and returns API-shaped objects.
 * Note: aggregation does not cast types, so `match` must use ObjectIds.
 */
export async function findIssues(match = {}, { sort = { createdAt: -1 }, limit } = {}) {
  const pipeline = [{ $match: match }, { $sort: sort }];
  if (limit) pipeline.push({ $limit: limit });
  pipeline.push(
    userLookup("reporter"),
    userLookup("assignee"),
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "issue",
        as: "comments",
        pipeline: [{ $project: { _id: 1 } }],
      },
    },
    {
      $addFields: {
        reporter: { $first: "$reporter" },
        assignee: { $first: "$assignee" },
        commentCount: { $size: "$comments" },
      },
    },
    { $project: { comments: 0, __v: 0 } }
  );

  const rows = await Issue.aggregate(pipeline);
  return rows.map(({ _id, reporter, assignee, ...rest }) => ({
    id: String(_id),
    ...rest,
    reporter: toUser(reporter),
    assignee: toUser(assignee),
  }));
}

export async function findIssueById(id) {
  const [issue] = await findIssues({ _id: id });
  return issue ?? null;
}
