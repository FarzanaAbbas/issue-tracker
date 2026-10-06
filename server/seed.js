// Seeds demo users, issues and comments. Safe to re-run: users are upserted
// and issues are only created when the database has none.
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Comment } from "./models/Comment.js";
import { Issue } from "./models/Issue.js";
import { User } from "./models/User.js";

const DEMO_PASSWORD = "demo1234";
const ADMIN = { name: "Admin User", email: "admin@issuetracker.dev", password: "admin1234" };

async function main() {
  await connectDB();
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const people = [
    { name: "Demo User", email: "demo@issuetracker.dev" },
    { name: "Alex Developer", email: "alex@issuetracker.dev" },
    { name: "Sam Tester", email: "sam@issuetracker.dev" },
  ];

  const [demo, alex, sam] = await Promise.all(
    people.map((p) =>
      User.findOneAndUpdate({ email: p.email }, { $setOnInsert: { ...p, password } }, { upsert: true, new: true })
    )
  );

  // Admin account for the admin panel (role is enforced even if the account already exists).
  await User.findOneAndUpdate(
    { email: ADMIN.email },
    {
      $setOnInsert: { name: ADMIN.name, email: ADMIN.email, password: await bcrypt.hash(ADMIN.password, 10) },
      $set: { role: "admin", active: true },
    },
    { upsert: true }
  );

  if (await Issue.exists({})) {
    console.log(`Issues already exist, skipping issue seed. Admin account: ${ADMIN.email} / ${ADMIN.password}`);
    return;
  }

  const issues = [
    { title: "Login page crashes on empty password", description: "Submitting the login form with an empty password returns a 500 instead of a validation error.", status: "OPEN", priority: "HIGH", reporter: sam._id, assignee: alex._id },
    { title: "Add dark mode to dashboard", description: "Users have asked for a dark theme on the dashboard.", status: "IN_PROGRESS", priority: "LOW", reporter: demo._id, assignee: demo._id },
    { title: "Export issues to CSV", description: "Allow exporting the filtered issue list as a CSV file.", status: "OPEN", priority: "MEDIUM", reporter: alex._id, assignee: null },
    { title: "Fix typo in welcome email", description: "'Recieve' should be 'receive'.", status: "CLOSED", priority: "LOW", reporter: demo._id, assignee: sam._id },
    { title: "Slow response on issues list", description: "The issues endpoint takes more than 2 seconds with 500+ issues. Add pagination or indexes.", status: "IN_PROGRESS", priority: "HIGH", reporter: sam._id, assignee: alex._id },
  ];

  for (const data of issues) {
    const issue = await Issue.create(data);
    await Comment.create({ body: "Thanks for reporting, looking into it.", issue: issue._id, author: alex._id });
  }

  console.log(`Seeded ${people.length} users and ${issues.length} issues. Password for all demo users: ${DEMO_PASSWORD}`);
  console.log(`Admin account: ${ADMIN.email} / ${ADMIN.password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
