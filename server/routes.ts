import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertSweetSchema, 
  searchSweetsSchema, 
  purchaseSchema, 
  restockSchema,
  insertCartItemSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}


// Auth middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Sweet routes
  app.get("/api/sweets", async (req, res) => {
    try {
      const sweets = await storage.getAllSweets();
      res.json(sweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sweets" });
    }
  });

  app.get("/api/sweets/search", async (req, res) => {
    try {
      const { query, category, minPrice, maxPrice } = searchSweetsSchema.parse(req.query);
      const sweets = await storage.searchSweets(
        query,
        category,
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined
      );
      res.json(sweets);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

 app.post("/api/sweets", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sweetData = insertSweetSchema.parse(req.body);
    console.log("Creating sweet with:", sweetData); // 🔍 log here
    const sweet = await storage.createSweet(sweetData);
    res.json(sweet);
  } catch (error) {
    console.error("Sweet creation failed:", error); // 🔍 log error
    res.status(400).json({ message: "Invalid sweet data" });
  }
});

  app.put("/api/sweets/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const sweetData = insertSweetSchema.partial().parse(req.body);
      const sweet = await storage.updateSweet(req.params.id, sweetData);
      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }
      res.json(sweet);
    } catch (error) {
      res.status(400).json({ message: "Invalid sweet data" });
    }
  });

  app.delete("/api/sweets/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSweet(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Sweet not found" });
      }
      res.json({ message: "Sweet deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sweet" });
    }
  });

  // Purchase route
  app.post("/api/sweets/:id/purchase", authenticateToken, async (req, res) => {
    try {
      const { quantity } = purchaseSchema.parse(req.body);
      const sweetId = req.params.id;
      
      const success = await storage.purchaseSweet(sweetId, quantity);
      if (!success) {
        return res.status(400).json({ message: "Insufficient stock or sweet not found" });
      }

      res.json({ message: "Purchase successful" });
    } catch (error) {
      res.status(400).json({ message: "Invalid purchase data" });
    }
  });

  // Restock route
  app.post("/api/sweets/:id/restock", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { quantity } = restockSchema.parse(req.body);
      const sweetId = req.params.id;
      
      const success = await storage.restockSweet(sweetId, quantity);
      if (!success) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      res.json({ message: "Restock successful" });
    } catch (error) {
      res.status(400).json({ message: "Invalid restock data" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const cartData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const cartItem = await storage.addToCart(cartData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart data" });
    }
  });

  app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
