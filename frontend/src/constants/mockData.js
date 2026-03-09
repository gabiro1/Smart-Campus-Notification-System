export const MOCK_USER = {
  name: "Amara Diallo",
  email: "amara@ur.ac.rw",
  role: "student",
  department: "Computer Science",
  school: "SET",
  year: "Year 3",
  interests: ["AI", "Web Dev", "Hackathons"],
};

export const MOCK_EVENTS = [
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
  {
    _id: "3",
    title: "Hackathon: FinTech for Africa",
    description:
      "48-hour hackathon focused on financial technology solutions for African markets. Teams of 3–4 students.",
    department: "All",
    school: "All",
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: "Innovation Hub",
    matchScore: 85,
    averageRating: 4.8,
    ratingCount: 31,
    interested: false,
    tags: ["Hackathon", "FinTech"],
  },
  {
    _id: "4",
    title: "Data Science Seminar",
    description:
      "Weekly seminar on data visualization, statistical analysis, and storytelling with data. Guest speaker from Irembo.",
    department: "Computer Science",
    school: "SET",
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: "Room 204",
    matchScore: 78,
    averageRating: 3.9,
    ratingCount: 12,
    interested: false,
    tags: ["Data", "Seminar"],
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    _id: "n1",
    title: "New Workshop Added",
    message:
      "AI & ML Workshop has been scheduled for next week. Register now to secure your spot.",
    status: "unread",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    eventId: { _id: "1", title: "AI & Machine Learning Workshop" },
  },
  {
    _id: "n2",
    title: "Reminder: Career Fair Tomorrow",
    message:
      "The Software Engineering Career Fair is tomorrow at the Main Hall. Doors open at 9 AM.",
    status: "read",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    eventId: { _id: "2", title: "Career Fair" },
  },
  {
    _id: "n3",
    title: "Hackathon Registration Open",
    message:
      "Registration for FinTech Hackathon is now open. Team deadline is Friday.",
    status: "unread",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    eventId: null,
  },
  {
    _id: "n4",
    title: "Seminar Recording Available",
    message:
      "Last week's Data Science seminar recording is now available on the student portal.",
    status: "read",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    eventId: null,
  },
];

export const MOCK_REMINDERS = [
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
  {
    _id: "r3",
    title: "Download Workshop Materials",
    note: "Pre-reading for ML Workshop",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: "medium",
    completed: true,
  },
];

export const MOCK_SUMMARY =
  "You have **3 upcoming events** this week. The AI Workshop (97% match) is your top pick — don't miss the hands-on TensorFlow session on Thursday. The Career Fair tomorrow features Google, Microsoft, and Andela recruiting. Meanwhile, the FinTech Hackathon is open for registration — form your team of 3–4 by Friday. **2 unread notifications** require your attention.";