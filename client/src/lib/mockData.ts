import { Users, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type User = {
  id: string;
  name: string;
  avatar: string;
  color: string; // Tailwind color class or hex
  status: "online" | "idle" | "offline";
  role: "Engineer" | "Reviewer" | "Architect";
  timezone: string; // e.g., "America/New_York"
  utcOffset: number; // e.g., -5
};

export type Task = {
  id: string;
  title: string;
  description: string;
  tag: "Design" | "Engineering" | "Product" | "Bug";
  priority: "High" | "Medium" | "Low";
  assignedTo: string[]; // User IDs
  activeViewers: string[]; // User IDs currently viewing this card
  comments: number;
};

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export type ADR = {
  id: string;
  title: string;
  status: "Proposed" | "Accepted" | "Rejected" | "Deprecated";
  date: string;
  authorId: string;
  tags: string[];
  summary: string;
};

export type PRReview = {
  id: string;
  title: string;
  authorId: string;
  riskLevel: "Low" | "Medium" | "High";
  summary: string;
  checklist: { id: string; text: string; checked: boolean }[];
};

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Alex Chen", avatar: "https://i.pravatar.cc/150?u=u1", color: "bg-blue-500", status: "online", role: "Architect", timezone: "America/Los_Angeles", utcOffset: -8 },
  { id: "u2", name: "Sarah Jones", avatar: "https://i.pravatar.cc/150?u=u2", color: "bg-purple-500", status: "online", role: "Engineer", timezone: "Europe/London", utcOffset: 0 },
  { id: "u3", name: "Mike Ross", avatar: "https://i.pravatar.cc/150?u=u3", color: "bg-emerald-500", status: "idle", role: "Reviewer", timezone: "Asia/Tokyo", utcOffset: 9 },
  { id: "u4", name: "Jessica Pearson", avatar: "https://i.pravatar.cc/150?u=u4", color: "bg-amber-500", status: "online", role: "Engineer", timezone: "America/New_York", utcOffset: -5 },
];

export const INITIAL_COLUMNS: Column[] = [
  {
    id: "col-1",
    title: "Backlog",
    tasks: [
      {
        id: "t-1",
        title: "Research Competitor Analysis",
        description: "Deep dive into Q4 strategies of main competitors.",
        tag: "Product",
        priority: "Low",
        assignedTo: ["u3"],
        activeViewers: [],
        comments: 2,
      },
      {
        id: "t-2",
        title: "Update API Documentation",
        description: "Reflect recent changes in the auth endpoints.",
        tag: "Engineering",
        priority: "Medium",
        assignedTo: ["u1"],
        activeViewers: ["u3"], // Mike is looking at this
        comments: 0,
      },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    tasks: [
      {
        id: "t-3",
        title: "Fix Navigation Bug on Mobile",
        description: "Menu doesn't collapse when clicking outside.",
        tag: "Bug",
        priority: "High",
        assignedTo: ["u1", "u2"],
        activeViewers: ["u1", "u2"], // COLLISION! Two people looking
        comments: 5,
      },
      {
        id: "t-4",
        title: "Design System Audit",
        description: "Check consistency of primary button styles.",
        tag: "Design",
        priority: "Medium",
        assignedTo: ["u4"],
        activeViewers: [],
        comments: 1,
      },
    ],
  },
  {
    id: "col-3",
    title: "Review",
    tasks: [
      {
        id: "t-5",
        title: "Integrate Stripe Payments",
        description: "Full checkout flow implementation.",
        tag: "Engineering",
        priority: "High",
        assignedTo: ["u2"],
        activeViewers: [],
        comments: 8,
      },
    ],
  },
  {
    id: "col-4",
    title: "Done",
    tasks: [
      {
        id: "t-6",
        title: "Q3 Marketing Plan",
        description: "Finalized and approved by board.",
        tag: "Product",
        priority: "High",
        assignedTo: ["u4"],
        activeViewers: [],
        comments: 12,
      },
    ],
  },
];

export const ACTIVITY_LOG = [
  { id: 1, user: "Alex Chen", action: "moved", target: "Fix Navigation Bug", time: "Just now" },
  { id: 2, user: "Sarah Jones", action: "commented on", target: "Design System Audit", time: "2m ago" },
  { id: 3, user: "Jessica Pearson", action: "completed", target: "Q3 Marketing Plan", time: "15m ago" },
  { id: 4, user: "Mike Ross", action: "viewing", target: "Update API Documentation", time: "Live" },
];

export const MOCK_ADRS: ADR[] = [
  {
    id: "adr-1",
    title: "ADR-001: Use PostgreSQL for Relational Data",
    status: "Accepted",
    date: "2025-10-15",
    authorId: "u1",
    tags: ["Database", "Backend"],
    summary: "We will use PostgreSQL as our primary relational database due to its robustness, JSON support, and active community."
  },
  {
    id: "adr-2",
    title: "ADR-002: Adopt Tailwind CSS for Styling",
    status: "Accepted",
    date: "2025-10-20",
    authorId: "u4",
    tags: ["Frontend", "Styling"],
    summary: "Tailwind CSS will be used to ensure consistency and speed up development. We will use a custom theme configuration."
  },
  {
    id: "adr-3",
    title: "ADR-003: Server-Side Rendering Strategy",
    status: "Proposed",
    date: "2025-11-01",
    authorId: "u2",
    tags: ["Frontend", "Performance"],
    summary: "Evaluating the shift to SSR for better SEO and initial load performance on marketing pages."
  }
];

export const MOCK_PRS: PRReview[] = [
  {
    id: "pr-102",
    title: "feat: Add user authentication flow",
    authorId: "u2",
    riskLevel: "High",
    summary: "Implements JWT based auth. Changes to security middleware detected.",
    checklist: [
      { id: "c1", text: "Verify token expiration handling", checked: false },
      { id: "c2", text: "Check for hardcoded secrets", checked: true },
      { id: "c3", text: "Ensure secure cookie settings", checked: false }
    ]
  },
  {
    id: "pr-103",
    title: "fix: Navbar responsiveness",
    authorId: "u4",
    riskLevel: "Low",
    summary: "CSS changes only. Updates breakpoints for mobile devices.",
    checklist: [
      { id: "c4", text: "Test on iPhone SE", checked: true },
      { id: "c5", text: "Check landscape mode", checked: false }
    ]
  }
];
