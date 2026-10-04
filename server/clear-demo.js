// Removes the demo data added by seed.js: the three @issuetracker.dev users,
// the issues they reported and all of their comments. Real users and their
// issues are kept; issues assigned to a demo user become unassigned.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Comment } from "./models/Comment.js";
import { Issue } from "./models/Issue.js";
import { User } from "./models/User.js";

const DEMO_EMAILS = ["demo@issuetracker.dev", "alex@issuetracker.dev", "sam@issuetracker.dev"];

async function main() {
  await connectDB();
  const demoIds = (await User.find({ email: { $in: DEMO_EMAILS } }, { _id: 1 })).map((u) => u._id);
  if (demoIds.length === 0) {
    console.log("No demo data found.");
    return;
  }

  const demoIssueIds = (await Issue.find({ reporter: { $in: demoIds } }, { _id: 1 })).map((i) => i._id);
  const [comments, issues] = await Promise.all([
    Comment.deleteMany({ $or: [{ issue: { $in: demoIssueIds } }, { author: { $in: demoIds } }] }),
    Issue.deleteMany({ _id: { $in: demoIssueIds } }),
  ]);
  // Runs after the deletes so only remaining (real) issues are counted.
  const unassigned = await Issue.updateMany({ assignee: { $in: demoIds } }, { $set: { assignee: null } });
  const users = await User.deleteMany({ _id: { $in: demoIds } });

  console.log(
    `Removed ${users.deletedCount} demo users, ${issues.deletedCount} issues and ${comments.deletedCount} comments; ` +
      `unassigned ${unassigned.modifiedCount} issues.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
