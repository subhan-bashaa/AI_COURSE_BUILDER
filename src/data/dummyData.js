// Dummy data for SkillPilot AI

export const roadmap = [
  { day: 1, topic: "HTML Basics - Tags & Structure", status: "done", duration: "2 hours" },
  { day: 2, topic: "CSS Fundamentals - Selectors & Properties", status: "done", duration: "2 hours" },
  { day: 3, topic: "CSS Flexbox & Grid", status: "done", duration: "2.5 hours" },
  { day: 4, topic: "Responsive Design Principles", status: "pending", duration: "2 hours" },
  { day: 5, topic: "JavaScript Basics - Variables & Types", status: "pending", duration: "2 hours" },
  { day: 6, topic: "JavaScript Functions & Scope", status: "pending", duration: "2 hours" },
  { day: 7, topic: "DOM Manipulation", status: "pending", duration: "2.5 hours" },
  { day: 8, topic: "Events & Event Handling", status: "pending", duration: "2 hours" },
  { day: 9, topic: "ES6+ Features", status: "pending", duration: "2 hours" },
  { day: 10, topic: "Async JavaScript & Promises", status: "pending", duration: "3 hours" },
  { day: 11, topic: "Fetch API & AJAX", status: "pending", duration: "2 hours" },
  { day: 12, topic: "Introduction to React", status: "pending", duration: "2.5 hours" },
  { day: 13, topic: "React Components & Props", status: "pending", duration: "2 hours" },
  { day: 14, topic: "React State & Hooks", status: "pending", duration: "2.5 hours" },
  { day: 15, topic: "Build a Responsive Navbar", status: "pending", duration: "2 hours" },
];

export const todayTask = {
  day: 4,
  topic: "Responsive Design Principles",
  description: "Learn media queries, mobile-first design, and responsive units (rem, em, %).",
  duration: "2 hours",
  resources: [
    "Watch: Responsive Design Tutorial",
    "Practice: Build a responsive card layout",
    "Reading: Mobile-first approach"
  ]
};

export const userProgress = {
  completedDays: 3,
  totalDays: 15,
  currentStreak: 3,
  learningHours: 6.5,
  activeGoals: 1,
  weeklyProgress: [
    { day: "Mon", hours: 2, completed: true },
    { day: "Tue", hours: 2, completed: true },
    { day: "Wed", hours: 2.5, completed: true },
    { day: "Thu", hours: 0, completed: false },
    { day: "Fri", hours: 0, completed: false },
    { day: "Sat", hours: 0, completed: false },
    { day: "Sun", hours: 0, completed: false },
  ]
};

export const userGoals = [
  {
    id: 1,
    title: "Become a Frontend Developer",
    currentLevel: "Beginner",
    timePerDay: "2 hours",
    deadline: "2026-04-15",
    progress: 20,
    status: "active"
  }
];

export const analyticsData = {
  totalHours: 6.5,
  completedTopics: 3,
  pendingTopics: 12,
  avgHoursPerDay: 2.16,
  consistency: 100, // percentage
  weeklyGoal: 14, // hours
  weeklyAchieved: 6.5, // hours
  monthlyStats: [
    { week: "Week 1", completed: 3, pending: 4 },
    { week: "Week 2", completed: 0, pending: 7 },
    { week: "Week 3", completed: 0, pending: 7 },
    { week: "Week 4", completed: 0, pending: 7 },
  ]
};
