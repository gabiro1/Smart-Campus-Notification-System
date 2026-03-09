// ─── MOCK DATA ─────────────────────────────
export const MOCK = {
  user: {
    name: "Amara Diallo",
    email: "amara@ur.ac.rw",
    role: "student",
    department: "Computer Science",
    school: "SET",
    year: "Year 3",
    interests: ["AI", "Web Dev", "Hackathons"],
  },
  events: [
    {
      _id: "1",
      title: "AI & Machine Learning Workshop",
      description:
        "Hands-on session with TensorFlow and PyTorch. Build your first neural network and learn how to deploy ML models in production environments.",
      department: "Computer Science",
      school: "SET",
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      location: "Lab B3",
      matchScore: 97,
      averageRating: 4.5,
      ratingCount: 24,
      interested: false,
      tags: ["AI", "Workshop"],
    },
    {
      _id: "2",
      title: "Software Engineering Career Fair",
      description:
        "Connect with top tech companies. Bring your CV and portfolio. Google, Microsoft, and Andela will be recruiting.",
      department: "Computer Science",
      school: "SET",
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      location: "Main Hall",
      matchScore: 89,
      averageRating: 4.2,
      ratingCount: 18,
      interested: true,
      tags: ["Career", "Networking"],
    },
  ],
  notifications: [
    {
      _id: "n1",
      title: "New Workshop Added",
      message:
        "AI & ML Workshop has been scheduled for next week. Register now to secure your spot.",
      status: "unread",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      eventId: { title: "AI & Machine Learning Workshop" },
    },
    {
      _id: "n2",
      title: "Reminder: Career Fair Tomorrow",
      message:
        "Don't forget! The Software Engineering Career Fair is tomorrow at the Main Hall. Doors open at 9 AM.",
      status: "read",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      eventId: { title: "Career Fair" },
    },
  ],
  reminders: [
    {
      _id: "r1",
      title: "Submit Hackathon Registration",
      note: "Register team before deadline",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      priority: "high",
      completed: false,
    },
    {
      _id: "r2",
      title: "Prepare CV for Career Fair",
      note: "Update with recent projects and skills",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: "high",
      completed: false,
    },
  ],
  summary:
    "You have **3 upcoming events** this week. The AI Workshop (97% match) is your top pick — don't miss the hands-on TensorFlow session on Thursday. The Career Fair tomorrow features Google, Microsoft, and Andela recruiting. Meanwhile, the FinTech Hackathon is open for registration — form your team of 3-4 by Friday. 2 unread notifications require your attention.",
};