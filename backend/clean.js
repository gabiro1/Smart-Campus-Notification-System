import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function clean() {
  await mongoose.connect(
    process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/smart-campus"
  );
  const db = mongoose.connection.db;

  const deptCodes = ["CS", "EE", "ME", "BA", "MATH", "PHY", "CHM", "BIO"];
  const depts = await db.collection("departments").deleteMany({ code: { $in: deptCodes } });
  const users = await db.collection("users").deleteMany({ department: { $exists: true, $ne: null } });
  const logs = await db.collection("notificationlogs").deleteMany({});

  console.log(
    "Cleaned: " + depts.deletedCount + " depts, " +
    users.deletedCount + " users, " +
    logs.deletedCount + " notification logs"
  );

  await mongoose.disconnect();
  process.exit(0);
}

clean().catch((err) => {
  console.error(err);
  process.exit(1);
});
