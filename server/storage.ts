import { 
  users, 
  competitors, 
  products, 
  competitorPricing, 
  priceHistory,
  type User, 
  type InsertUser,
  type Competitor,
  type InsertCompetitor,
  type Product,
  type InsertProduct,
  type CompetitorPricing,
  type InsertCompetitorPricing,
  type PriceHistory,
  type InsertPriceHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: "admin" | "sales_manager" | "sales_rep"): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Competitor methods
  getCompetitors(): Promise<Competitor[]>;
  getCompetitor(id: string): Promise<Competitor | undefined>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(id: string, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined>;
  deleteCompetitor(id: string): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Competitor Pricing methods
  getCompetitorPricing(): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User })[]>;
  getCompetitorPricingById(id: string): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User }) | undefined>;
  createCompetitorPricing(pricing: InsertCompetitorPricing): Promise<CompetitorPricing>;
  updateCompetitorPricing(id: string, pricing: Partial<InsertCompetitorPricing>): Promise<CompetitorPricing | undefined>;
  deleteCompetitorPricing(id: string): Promise<boolean>;
  getCompetitorPricingByFilters(competitorId?: string, productId?: string, startDate?: Date, endDate?: Date): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User })[]>;
  
  // Price History methods
  getPriceHistory(competitorPricingId: string): Promise<(PriceHistory & { updatedByUser: User })[]>;
  createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  
  // Analytics methods
  getKPIData(): Promise<{
    competitorsTracked: number;
    avgPriceDifference: number;
    productsMonitored: number;
    marketShare: number;
  }>;
  getPriceTrends(days: number): Promise<any[]>;
  getTopCompetitors(limit: number): Promise<any[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserRole(id: string, role: "admin" | "sales_manager" | "sales_rep"): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Competitor methods
  async getCompetitors(): Promise<Competitor[]> {
    return await db.select().from(competitors).orderBy(competitors.name);
  }

  async getCompetitor(id: string): Promise<Competitor | undefined> {
    const [competitor] = await db.select().from(competitors).where(eq(competitors.id, id));
    return competitor || undefined;
  }

  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const [newCompetitor] = await db.insert(competitors).values(competitor).returning();
    return newCompetitor;
  }

  async updateCompetitor(id: string, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined> {
    const [updated] = await db.update(competitors).set(competitor).where(eq(competitors.id, id)).returning();
    return updated || undefined;
  }

  async deleteCompetitor(id: string): Promise<boolean> {
    const result = await db.delete(competitors).where(eq(competitors.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Competitor Pricing methods
  async getCompetitorPricing(): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User })[]> {
    return await db.select({
      id: competitorPricing.id,
      competitorId: competitorPricing.competitorId,
      productId: competitorPricing.productId,
      price: competitorPricing.price,
      currency: competitorPricing.currency,
      notes: competitorPricing.notes,
      updatedBy: competitorPricing.updatedBy,
      createdAt: competitorPricing.createdAt,
      updatedAt: competitorPricing.updatedAt,
      competitor: competitors,
      product: products,
      updatedByUser: users,
    })
    .from(competitorPricing)
    .innerJoin(competitors, eq(competitorPricing.competitorId, competitors.id))
    .innerJoin(products, eq(competitorPricing.productId, products.id))
    .innerJoin(users, eq(competitorPricing.updatedBy, users.id))
    .orderBy(desc(competitorPricing.updatedAt));
  }

  async getCompetitorPricingById(id: string): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User }) | undefined> {
    const [pricing] = await db.select({
      id: competitorPricing.id,
      competitorId: competitorPricing.competitorId,
      productId: competitorPricing.productId,
      price: competitorPricing.price,
      currency: competitorPricing.currency,
      notes: competitorPricing.notes,
      updatedBy: competitorPricing.updatedBy,
      createdAt: competitorPricing.createdAt,
      updatedAt: competitorPricing.updatedAt,
      competitor: competitors,
      product: products,
      updatedByUser: users,
    })
    .from(competitorPricing)
    .innerJoin(competitors, eq(competitorPricing.competitorId, competitors.id))
    .innerJoin(products, eq(competitorPricing.productId, products.id))
    .innerJoin(users, eq(competitorPricing.updatedBy, users.id))
    .where(eq(competitorPricing.id, id));
    
    return pricing || undefined;
  }

  async createCompetitorPricing(pricing: InsertCompetitorPricing): Promise<CompetitorPricing> {
    const [newPricing] = await db.insert(competitorPricing).values({
      ...pricing,
      updatedAt: new Date()
    }).returning();
    return newPricing;
  }

  async updateCompetitorPricing(id: string, pricing: Partial<InsertCompetitorPricing>): Promise<CompetitorPricing | undefined> {
    const [updated] = await db.update(competitorPricing).set({
      ...pricing,
      updatedAt: new Date()
    }).where(eq(competitorPricing.id, id)).returning();
    return updated || undefined;
  }

  async deleteCompetitorPricing(id: string): Promise<boolean> {
    const result = await db.delete(competitorPricing).where(eq(competitorPricing.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCompetitorPricingByFilters(competitorId?: string, productId?: string, startDate?: Date, endDate?: Date): Promise<(CompetitorPricing & { competitor: Competitor; product: Product; updatedByUser: User })[]> {
    let query = db.select({
      id: competitorPricing.id,
      competitorId: competitorPricing.competitorId,
      productId: competitorPricing.productId,
      price: competitorPricing.price,
      currency: competitorPricing.currency,
      notes: competitorPricing.notes,
      updatedBy: competitorPricing.updatedBy,
      createdAt: competitorPricing.createdAt,
      updatedAt: competitorPricing.updatedAt,
      competitor: competitors,
      product: products,
      updatedByUser: users,
    })
    .from(competitorPricing)
    .innerJoin(competitors, eq(competitorPricing.competitorId, competitors.id))
    .innerJoin(products, eq(competitorPricing.productId, products.id))
    .innerJoin(users, eq(competitorPricing.updatedBy, users.id));

    const conditions = [];
    if (competitorId) conditions.push(eq(competitorPricing.competitorId, competitorId));
    if (productId) conditions.push(eq(competitorPricing.productId, productId));
    if (startDate) conditions.push(gte(competitorPricing.updatedAt, startDate));
    if (endDate) conditions.push(lte(competitorPricing.updatedAt, endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(competitorPricing.updatedAt));
  }

  // Price History methods
  async getPriceHistory(competitorPricingId: string): Promise<(PriceHistory & { updatedByUser: User })[]> {
    return await db.select({
      id: priceHistory.id,
      competitorPricingId: priceHistory.competitorPricingId,
      oldPrice: priceHistory.oldPrice,
      newPrice: priceHistory.newPrice,
      changePercentage: priceHistory.changePercentage,
      updatedBy: priceHistory.updatedBy,
      createdAt: priceHistory.createdAt,
      updatedByUser: users,
    })
    .from(priceHistory)
    .innerJoin(users, eq(priceHistory.updatedBy, users.id))
    .where(eq(priceHistory.competitorPricingId, competitorPricingId))
    .orderBy(desc(priceHistory.createdAt));
  }

  async createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const [newHistory] = await db.insert(priceHistory).values(history).returning();
    return newHistory;
  }

  // Analytics methods
  async getKPIData(): Promise<{
    competitorsTracked: number;
    avgPriceDifference: number;
    productsMonitored: number;
    marketShare: number;
  }> {
    const competitorsCount = await db.select({ count: sql<number>`count(*)` }).from(competitors);
    const productsCount = await db.select({ count: sql<number>`count(*)` }).from(products);
    
    return {
      competitorsTracked: competitorsCount[0]?.count || 0,
      avgPriceDifference: -8.5, // This would be calculated based on actual data
      productsMonitored: productsCount[0]?.count || 0,
      marketShare: 23.4, // This would be calculated based on actual market data
    };
  }

  async getPriceTrends(days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select({
      date: competitorPricing.updatedAt,
      price: competitorPricing.price,
      competitor: competitors.name,
      product: products.name,
    })
    .from(competitorPricing)
    .innerJoin(competitors, eq(competitorPricing.competitorId, competitors.id))
    .innerJoin(products, eq(competitorPricing.productId, products.id))
    .where(gte(competitorPricing.updatedAt, startDate))
    .orderBy(competitorPricing.updatedAt);
  }

  async getTopCompetitors(limit: number): Promise<any[]> {
    return await db.select({
      id: competitors.id,
      name: competitors.name,
      category: competitors.category,
      avgPrice: sql<number>`avg(${competitorPricing.price})`,
      priceCount: sql<number>`count(${competitorPricing.id})`,
    })
    .from(competitors)
    .leftJoin(competitorPricing, eq(competitors.id, competitorPricing.competitorId))
    .groupBy(competitors.id, competitors.name, competitors.category)
    .orderBy(sql`count(${competitorPricing.id}) desc`)
    .limit(limit);
  }
}

export const storage = new DatabaseStorage();
