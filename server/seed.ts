// Seed script to initialize database with sample data
import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Create users
    const user1 = await storage.createUser({
      name: "Alex Chen",
      email: "alex@syncflow.com",
      avatar: "https://i.pravatar.cc/150?u=u1",
      role: "Architect",
      timezone: "America/Los_Angeles",
      utcOffset: -8,
      status: "online",
    });

    const user2 = await storage.createUser({
      name: "Sarah Jones",
      email: "sarah@syncflow.com",
      avatar: "https://i.pravatar.cc/150?u=u2",
      role: "Engineer",
      timezone: "Europe/London",
      utcOffset: 0,
      status: "online",
    });

    const user3 = await storage.createUser({
      name: "Mike Ross",
      email: "mike@syncflow.com",
      avatar: "https://i.pravatar.cc/150?u=u3",
      role: "Reviewer",
      timezone: "Asia/Tokyo",
      utcOffset: 9,
      status: "idle",
    });

    const user4 = await storage.createUser({
      name: "Jessica Pearson",
      email: "jessica@syncflow.com",
      avatar: "https://i.pravatar.cc/150?u=u4",
      role: "Engineer",
      timezone: "America/New_York",
      utcOffset: -5,
      status: "online",
    });

    console.log("✓ Created 4 users");

    // Create columns
    const col1 = await storage.createColumn({ title: "Backlog", position: 0 });
    const col2 = await storage.createColumn({ title: "In Progress", position: 1 });
    const col3 = await storage.createColumn({ title: "Review", position: 2 });
    const col4 = await storage.createColumn({ title: "Done", position: 3 });

    console.log("✓ Created 4 columns");

    // Create sample tasks
    await storage.createTask({
      title: "Research Competitor Analysis",
      description: "Deep dive into Q4 strategies of main competitors.",
      tag: "Product",
      priority: "Low",
      columnId: col1.id,
      assignedTo: [user3.id],
      activeViewers: [],
      comments: 2,
    });

    await storage.createTask({
      title: "Update API Documentation",
      description: "Reflect recent changes in the auth endpoints.",
      tag: "Engineering",
      priority: "Medium",
      columnId: col1.id,
      assignedTo: [user1.id],
      activeViewers: [user3.id],
      comments: 0,
    });

    await storage.createTask({
      title: "Fix Navigation Bug on Mobile",
      description: "Menu doesn't collapse when clicking outside.",
      tag: "Bug",
      priority: "High",
      columnId: col2.id,
      assignedTo: [user1.id, user2.id],
      activeViewers: [user1.id, user2.id],
      comments: 5,
    });

    await storage.createTask({
      title: "Design System Audit",
      description: "Check consistency of primary button styles.",
      tag: "Design",
      priority: "Medium",
      columnId: col2.id,
      assignedTo: [user4.id],
      activeViewers: [],
      comments: 1,
    });

    await storage.createTask({
      title: "Integrate Stripe Payments",
      description: "Full checkout flow implementation.",
      tag: "Engineering",
      priority: "High",
      columnId: col3.id,
      assignedTo: [user2.id],
      activeViewers: [],
      comments: 8,
    });

    await storage.createTask({
      title: "Q3 Marketing Plan",
      description: "Finalized and approved by board.",
      tag: "Product",
      priority: "High",
      columnId: col4.id,
      assignedTo: [user4.id],
      activeViewers: [],
      comments: 12,
    });

    console.log("✓ Created 6 sample tasks");

    // Create sample ADRs
    await storage.createAdr({
      title: "ADR-001: Use PostgreSQL for Relational Data",
      status: "Accepted",
      summary: "We will use PostgreSQL as our primary relational database due to its robustness, JSON support, and active community.",
      authorId: user1.id,
      tags: ["Database", "Backend"],
    });

    await storage.createAdr({
      title: "ADR-002: Adopt Tailwind CSS for Styling",
      status: "Accepted",
      summary: "Tailwind CSS will be used to ensure consistency and speed up development. We will use a custom theme configuration.",
      authorId: user4.id,
      tags: ["Frontend", "Styling"],
    });

    await storage.createAdr({
      title: "ADR-003: Server-Side Rendering Strategy",
      status: "Proposed",
      summary: "Evaluating the shift to SSR for better SEO and initial load performance on marketing pages.",
      authorId: user2.id,
      tags: ["Frontend", "Performance"],
    });

    console.log("✓ Created 3 ADRs");

    // Create sample PR reviews
    await storage.createPrReview({
      title: "feat: Add user authentication flow",
      authorId: user2.id,
      riskLevel: "High",
      summary: "Implements JWT based auth. Changes to security middleware detected.",
      checklist: [
        { id: "c1", text: "Verify token expiration handling", checked: false },
        { id: "c2", text: "Check for hardcoded secrets", checked: true },
        { id: "c3", text: "Ensure secure cookie settings", checked: false }
      ],
    });

    await storage.createPrReview({
      title: "fix: Navbar responsiveness",
      authorId: user4.id,
      riskLevel: "Low",
      summary: "CSS changes only. Updates breakpoints for mobile devices.",
      checklist: [
        { id: "c4", text: "Test on iPhone SE", checked: true },
        { id: "c5", text: "Check landscape mode", checked: false }
      ],
    });

    console.log("✓ Created 2 PR reviews");

    // Create sample activities
    await storage.createActivity({
      userId: user1.id,
      action: "moved",
      target: "Fix Navigation Bug",
    });

    await storage.createActivity({
      userId: user2.id,
      action: "commented on",
      target: "Design System Audit",
    });

    await storage.createActivity({
      userId: user4.id,
      action: "completed",
      target: "Q3 Marketing Plan",
    });

    console.log("✓ Created 3 activities");
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
