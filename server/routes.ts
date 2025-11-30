import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertColumnSchema, insertTaskSchema,
  insertAdrSchema, insertPrReviewSchema, insertActivitySchema, insertNotificationSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== Users API ====================
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      await storage.updateUserStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Columns API ====================
  app.get("/api/columns", async (req, res) => {
    try {
      const columns = await storage.getAllColumns();
      res.json(columns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/columns", async (req, res) => {
    try {
      const result = insertColumnSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const column = await storage.createColumn(result.data);
      res.status(201).json(column);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/columns/:id", async (req, res) => {
    try {
      await storage.deleteColumn(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Tasks API ====================
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/columns/:columnId/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByColumn(req.params.columnId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const result = insertTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const task = await storage.createTask(result.data);
      
      // Log activity
      if (req.body.createdBy) {
        await storage.createActivity({
          userId: req.body.createdBy,
          action: "created",
          target: task.title,
        });
      }
      
      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      
      // Log activity
      if (req.body.movedBy) {
        await storage.createActivity({
          userId: req.body.movedBy,
          action: "moved",
          target: task.title,
        });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id/viewers", async (req, res) => {
    try {
      const { viewerIds } = req.body;
      if (!Array.isArray(viewerIds)) {
        return res.status(400).json({ error: "viewerIds must be an array" });
      }
      await storage.updateTaskViewers(req.params.id, viewerIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ADRs API ====================
  app.get("/api/adrs", async (req, res) => {
    try {
      const adrs = await storage.getAllAdrs();
      res.json(adrs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/adrs/:id", async (req, res) => {
    try {
      const adr = await storage.getAdr(req.params.id);
      if (!adr) {
        return res.status(404).json({ error: "ADR not found" });
      }
      res.json(adr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/adrs", async (req, res) => {
    try {
      const result = insertAdrSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const adr = await storage.createAdr(result.data);
      
      // Log activity
      await storage.createActivity({
        userId: result.data.authorId,
        action: "proposed",
        target: adr.title,
      });
      
      res.status(201).json(adr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/adrs/:id", async (req, res) => {
    try {
      const adr = await storage.updateAdr(req.params.id, req.body);
      res.json(adr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PR Reviews API ====================
  app.get("/api/pr-reviews", async (req, res) => {
    try {
      const prs = await storage.getAllPrReviews();
      res.json(prs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pr-reviews/:id", async (req, res) => {
    try {
      const pr = await storage.getPrReview(req.params.id);
      if (!pr) {
        return res.status(404).json({ error: "PR Review not found" });
      }
      res.json(pr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pr-reviews", async (req, res) => {
    try {
      const result = insertPrReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const pr = await storage.createPrReview(result.data);
      
      // Log activity
      await storage.createActivity({
        userId: result.data.authorId,
        action: "submitted PR",
        target: pr.title,
      });
      
      res.status(201).json(pr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Activities API ====================
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const result = insertActivitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const activity = await storage.createActivity(result.data);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Board Data (Combined) ====================
  app.get("/api/board", async (req, res) => {
    try {
      const [columns, tasks] = await Promise.all([
        storage.getAllColumns(),
        storage.getAllTasks(),
      ]);
      
      // Group tasks by column
      const columnsWithTasks = columns.map(col => ({
        ...col,
        tasks: tasks.filter(task => task.columnId === col.id),
      }));
      
      res.json(columnsWithTasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Notifications API ====================
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const notification = await storage.createNotification(result.data);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      await storage.markAllNotificationsRead(req.params.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI Chatbot API ====================
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const systemPrompt = `You are SyncFlow AI Assistant, a helpful assistant for a collaborative task management platform. You help users with:
- Project management and task organization
- Code review best practices
- Architecture decisions (ADRs)
- Team collaboration and communication
- Time zone coordination for distributed teams

Be concise, friendly, and helpful. Keep responses under 150 words unless more detail is needed.`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
      });

      const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      res.json({ reply });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });

  // ==================== PR Analysis API (AI-powered) ====================
  app.post("/api/pr-reviews/analyze", async (req, res) => {
    try {
      const { prUrl, diffContent, title, authorId } = req.body;
      
      if (!diffContent && !prUrl) {
        return res.status(400).json({ error: "Either diffContent or prUrl is required" });
      }
      if (!authorId) {
        return res.status(400).json({ error: "authorId is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const contentToAnalyze = diffContent || `PR URL: ${prUrl}`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a senior code reviewer. Analyze the provided code diff or PR information and provide:
1. A brief summary (2-3 sentences)
2. Risk level (Low, Medium, or High)
3. A checklist of items to review (3-6 items)

Respond in JSON format:
{
  "summary": "Brief description of what this PR does",
  "riskLevel": "Low|Medium|High",
  "checklist": [
    { "id": "c1", "text": "Check item description", "checked": false },
    { "id": "c2", "text": "Another check item", "checked": false }
  ]
}`
          },
          {
            role: "user",
            content: `Analyze this code change:\n\n${contentToAnalyze}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysisText = completion.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error("No analysis generated");
      }

      const analysis = JSON.parse(analysisText);
      
      // Create the PR review in database
      const prReview = await storage.createPrReview({
        title: title || `PR Analysis - ${new Date().toLocaleDateString()}`,
        authorId,
        riskLevel: analysis.riskLevel || "Medium",
        summary: analysis.summary || "Analysis completed",
        checklist: analysis.checklist || [],
      });

      // Log activity
      await storage.createActivity({
        userId: authorId,
        action: "analyzed PR",
        target: prReview.title,
      });

      // Create notification for the author
      await storage.createNotification({
        userId: authorId,
        type: "pr_review",
        title: "PR Analysis Complete",
        message: `Your PR "${prReview.title}" has been analyzed. Risk level: ${prReview.riskLevel}`,
        link: "/prs",
        read: false,
      });

      res.status(201).json(prReview);
    } catch (error: any) {
      console.error("PR Analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze PR" });
    }
  });

  return httpServer;
}
