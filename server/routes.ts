import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCompetitorSchema, insertProductSchema, insertCompetitorPricingSchema } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // KPI and Analytics routes
  app.get("/api/kpi", requireAuth, async (req, res) => {
    try {
      const kpiData = await storage.getKPIData();
      res.json(kpiData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KPI data" });
    }
  });

  app.get("/api/price-trends", requireAuth, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await storage.getPriceTrends(days);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price trends" });
    }
  });

  app.get("/api/top-competitors", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const competitors = await storage.getTopCompetitors(limit);
      res.json(competitors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top competitors" });
    }
  });

  // Competitor routes
  app.get("/api/competitors", requireAuth, async (req, res) => {
    try {
      const competitors = await storage.getCompetitors();
      res.json(competitors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitors" });
    }
  });

  app.post("/api/competitors", requireRole(["admin", "sales_manager"]), async (req, res) => {
    try {
      const validatedData = insertCompetitorSchema.parse(req.body);
      const competitor = await storage.createCompetitor(validatedData);
      res.status(201).json(competitor);
    } catch (error) {
      res.status(400).json({ message: "Invalid competitor data" });
    }
  });

  app.put("/api/competitors/:id", requireRole(["admin", "sales_manager"]), async (req, res) => {
    try {
      const competitor = await storage.updateCompetitor(req.params.id, req.body);
      if (!competitor) {
        return res.status(404).json({ message: "Competitor not found" });
      }
      res.json(competitor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update competitor" });
    }
  });

  app.delete("/api/competitors/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const success = await storage.deleteCompetitor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Competitor not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete competitor" });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireRole(["admin", "sales_manager"]), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  // Competitor Pricing routes
  app.get("/api/competitor-pricing", requireAuth, async (req, res) => {
    try {
      const { competitorId, productId, startDate, endDate } = req.query;
      let pricing;
      
      if (competitorId || productId || startDate || endDate) {
        pricing = await storage.getCompetitorPricingByFilters(
          competitorId as string,
          productId as string,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );
      } else {
        pricing = await storage.getCompetitorPricing();
      }
      
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitor pricing" });
    }
  });

  app.post("/api/competitor-pricing", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCompetitorPricingSchema.parse({
        ...req.body,
        updatedBy: req.user!.id
      });
      
      // Check if pricing for this competitor-product combination exists
      const existing = await storage.getCompetitorPricingByFilters(
        validatedData.competitorId, 
        validatedData.productId
      );
      
      let pricing;
      if (existing.length > 0) {
        // Update existing pricing and create history entry
        const existingPricing = existing[0];
        pricing = await storage.updateCompetitorPricing(existingPricing.id, validatedData);
        
        // Create price history entry
        if (existingPricing.price !== validatedData.price) {
          const oldPrice = parseFloat(existingPricing.price);
          const newPrice = parseFloat(validatedData.price);
          const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;
          
          await storage.createPriceHistory({
            competitorPricingId: existingPricing.id,
            oldPrice: existingPricing.price,
            newPrice: validatedData.price,
            changePercentage: changePercentage.toString(),
            updatedBy: req.user!.id
          });
        }
      } else {
        // Create new pricing entry
        pricing = await storage.createCompetitorPricing(validatedData);
      }
      
      res.status(201).json(pricing);
    } catch (error) {
      res.status(400).json({ message: "Invalid pricing data" });
    }
  });

  app.delete("/api/competitor-pricing/:id", requireRole(["admin", "sales_manager"]), async (req, res) => {
    try {
      const success = await storage.deleteCompetitorPricing(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Pricing entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pricing entry" });
    }
  });

  // Price History routes
  app.get("/api/price-history/:competitorPricingId", requireAuth, async (req, res) => {
    try {
      const history = await storage.getPriceHistory(req.params.competitorPricingId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // User Management routes (Admin only)
  app.get("/api/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id/role", requireRole(["admin"]), async (req, res) => {
    try {
      const { role } = req.body;
      if (!["admin", "sales_manager", "sales_rep"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
