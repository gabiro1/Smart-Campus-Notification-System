import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/smart-campus";

const DepartmentSchema = new mongoose.Schema({ name: String, code: String, school: { type: mongoose.Schema.Types.ObjectId, ref: "School" } });
const UserSchema = new mongoose.Schema({ name: String, email: String, role: String, department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" } }, { timestamps: true });
const NotificationLogSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, status: String, message: String, title: String,
}, { timestamps: true });

const Department = mongoose.model("Department", DepartmentSchema);
const User = mongoose.model("User", UserSchema);
const NotificationLog = mongoose.model("NotificationLog", NotificationLogSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing seed data
  await Department.deleteMany({});
  await User.deleteMany({ role: { $in: ["student", "lecturer", "hod"] } });
  await NotificationLog.deleteMany({});

  // Create departments
  const depts = await Department.insertMany([
    { name: "Computer Science", code: "CS" },
    { name: "Electrical Engineering", code: "EE" },
    { name: "Mechanical Engineering", code: "ME" },
    { name: "Business Administration", code: "BA" },
    { name: "Mathematics", code: "MATH" },
    { name: "Physics", code: "PHY" },
    { name: "Chemistry", code: "CHM" },
    { name: "Biology", code: "BIO" },
  ]);
  console.log(`Created ${depts.length} departments`);

  // Create users for each department
  const users = [];
  for (const dept of depts) {
    for (let i = 0; i < 5 + Math.floor(Math.random() * 10); i++) {
      users.push({
        name: `User ${dept.code}-${i + 1}`,
        email: `${dept.code.toLowerCase()}.user${i + 1}@university.edu`,
        role: ["student", "student", "student", "lecturer", "hod"][i % 5],
        department: dept._id,
      });
    }
  }
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);

  // Create notification logs over the past 14 days
  const logs = [];
  const statuses = ["sent", "delivered", "read"];
  const types = ["info", "warning", "success", "event", "announcement"];

  for (const user of createdUsers) {
    const count = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
      logs.push({
        recipientId: user._id,
        studentId: user._id,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        message: `Sample notification ${i + 1} for ${user.name}`,
        title: `${user.role} notification`,
        createdAt: date,
        updatedAt: date,
      });
    }
  }
  const createdLogs = await NotificationLog.insertMany(logs);
  console.log(`Created ${createdLogs.length} notification logs`);

  console.log("\n✅ Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
