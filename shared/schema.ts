import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, pgEnum, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "sales_manager", "sales_rep"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default("sales_rep"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  website: text("website"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  ourPrice: decimal("our_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorPricing = pgTable("competitor_pricing", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: uuid("competitor_id").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  notes: text("notes"),
  updatedBy: uuid("updated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorPricingId: uuid("competitor_pricing_id").notNull().references(() => competitorPricing.id, { onDelete: "cascade" }),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  changePercentage: decimal("change_percentage", { precision: 5, scale: 2 }),
  updatedBy: uuid("updated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  competitorPricing: many(competitorPricing),
  priceHistory: many(priceHistory),
}));

export const competitorsRelations = relations(competitors, ({ many }) => ({
  pricing: many(competitorPricing),
}));

export const productsRelations = relations(products, ({ many }) => ({
  competitorPricing: many(competitorPricing),
}));

export const competitorPricingRelations = relations(competitorPricing, ({ one, many }) => ({
  competitor: one(competitors, {
    fields: [competitorPricing.competitorId],
    references: [competitors.id],
  }),
  product: one(products, {
    fields: [competitorPricing.productId],
    references: [products.id],
  }),
  updatedByUser: one(users, {
    fields: [competitorPricing.updatedBy],
    references: [users.id],
  }),
  history: many(priceHistory),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  competitorPricing: one(competitorPricing, {
    fields: [priceHistory.competitorPricingId],
    references: [competitorPricing.id],
  }),
  updatedByUser: one(users, {
    fields: [priceHistory.updatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitorSchema = createInsertSchema(competitors).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitorPricingSchema = createInsertSchema(competitorPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CompetitorPricing = typeof competitorPricing.$inferSelect;
export type InsertCompetitorPricing = z.infer<typeof insertCompetitorPricingSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
