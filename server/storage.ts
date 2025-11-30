import { 
  users, columns, tasks, adrs, prReviews, activities, notifications,
  type User, type InsertUser,
  type Column, type InsertColumn,
  type Task, type InsertTask,
  type Adr, type InsertAdr,
  type PrReview, type InsertPrReview,
  type Activity, type InsertActivity,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: string): Promise<void>;

  // Columns
  getAllColumns(): Promise<Column[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  deleteColumn(id: string): Promise<void>;

  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTasksByColumn(columnId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  updateTaskViewers(id: string, viewerIds: string[]): Promise<void>;

  // ADRs
  getAllAdrs(): Promise<Adr[]>;
  getAdr(id: string): Promise<Adr | undefined>;
  createAdr(adr: InsertAdr): Promise<Adr>;
  updateAdr(id: string, updates: Partial<InsertAdr>): Promise<Adr>;

  // PR Reviews
  getAllPrReviews(): Promise<PrReview[]>;
  getPrReview(id: string): Promise<PrReview | undefined>;
  createPrReview(pr: InsertPrReview): Promise<PrReview>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await db.update(users).set({ status }).where(eq(users.id, id));
  }

  // Columns
  async getAllColumns(): Promise<Column[]> {
    return await db.select().from(columns).orderBy(columns.position);
  }

  async createColumn(insertColumn: InsertColumn): Promise<Column> {
    const [column] = await db.insert(columns).values(insertColumn).returning();
    return column;
  }

  async deleteColumn(id: string): Promise<void> {
    await db.delete(columns).where(eq(columns.id, id));
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.columnId, columnId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async updateTaskViewers(id: string, viewerIds: string[]): Promise<void> {
    await db.update(tasks).set({ activeViewers: viewerIds }).where(eq(tasks.id, id));
  }

  // ADRs
  async getAllAdrs(): Promise<Adr[]> {
    return await db.select().from(adrs).orderBy(desc(adrs.createdAt));
  }

  async getAdr(id: string): Promise<Adr | undefined> {
    const [adr] = await db.select().from(adrs).where(eq(adrs.id, id));
    return adr || undefined;
  }

  async createAdr(insertAdr: InsertAdr): Promise<Adr> {
    const [adr] = await db.insert(adrs).values(insertAdr).returning();
    return adr;
  }

  async updateAdr(id: string, updates: Partial<InsertAdr>): Promise<Adr> {
    const [adr] = await db
      .update(adrs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adrs.id, id))
      .returning();
    return adr;
  }

  // PR Reviews
  async getAllPrReviews(): Promise<PrReview[]> {
    return await db.select().from(prReviews).orderBy(desc(prReviews.createdAt));
  }

  async getPrReview(id: string): Promise<PrReview | undefined> {
    const [pr] = await db.select().from(prReviews).where(eq(prReviews.id, id));
    return pr || undefined;
  }

  async createPrReview(insertPr: InsertPrReview): Promise<PrReview> {
    const [pr] = await db.insert(prReviews).values(insertPr).returning();
    return pr;
  }

  // Activities
  async getRecentActivities(limit: number = 20): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result[0]?.count || 0;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
