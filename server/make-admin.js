// Promotes an existing account to admin:  npm run make-admin -- someone@example.com
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exitCode = 1;
    return;
  }
  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin", active: true } }, { new: true });
  if (!user) {
    console.error(`No account found for ${email}. Register it in the app first.`);
    process.exitCode = 1;
    return;
  }
  console.log(`${user.name} <${user.email}> is now an admin.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
