// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
var MemStorage = class {
  users;
  sweets;
  orders;
  orderItems;
  cartItems;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.sweets = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.orderItems = /* @__PURE__ */ new Map();
    this.cartItems = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  async initializeSampleData() {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = {
      id: "admin-user-id",
      username: "admin",
      email: "admin@sweetshop.com",
      password: adminPassword,
      role: "admin",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(adminUser.id, adminUser);
    const customerPassword = await bcrypt.hash("customer123", 10);
    const customerUser = {
      id: "customer-user-id",
      username: "customer",
      email: "customer@sweetshop.com",
      password: customerPassword,
      role: "customer",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(customerUser.id, customerUser);
    const sampleSweets = [
      {
        id: "1",
        name: "Gulab Jamun",
        category: "mithai",
        description: "Soft, spongy milk-solid balls soaked in aromatic sugar syrup",
        price: "180.00",
        quantity: 25,
        imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?ixlib=rb-4.0.3&w=600&h=400",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "2",
        name: "Kaju Katli",
        category: "barfi",
        description: "Premium cashew-based diamond-shaped delicacy with silver foil",
        price: "450.00",
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&w=600&h=400",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "3",
        name: "Besan Laddu",
        category: "laddu",
        description: "Traditional gram flour balls with ghee and cardamom",
        price: "120.00",
        quantity: 40,
        imageUrl: "https://pixabay.com/get/g08318f2ba80e37ba18d8e5b6c5139b06e77f14423b81e09fda7614a054162cc80785668b5f7ed3ac3482407b77f23f8fb9b14d1d96f894da242f76df314c5685_1280.jpg",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "4",
        name: "Gajar Halwa",
        category: "halwa",
        description: "Rich carrot-based dessert with milk, nuts and cardamom",
        price: "200.00",
        quantity: 0,
        imageUrl: "https://pixabay.com/get/g0a31c40ceb154783afe73d8d1940a2f0b04549e787fb264d584be15c855008552df965bc26af71c9ef56ff8d00921402e91e21b900fe319f3a8aa51a968f1ee2_1280.jpg",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    sampleSweets.forEach((sweet) => {
      this.sweets.set(sweet.id, sweet);
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      role: insertUser.role || "customer",
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  // Sweet methods
  async getAllSweets() {
    return Array.from(this.sweets.values());
  }
  async getSweet(id) {
    return this.sweets.get(id);
  }
  async createSweet(insertSweet) {
    const id = randomUUID();
    const sweet = {
      ...insertSweet,
      quantity: insertSweet.quantity || 0,
      imageUrl: insertSweet.imageUrl || null,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sweets.set(id, sweet);
    return sweet;
  }
  async updateSweet(id, updates) {
    const sweet = this.sweets.get(id);
    if (!sweet) return void 0;
    const updatedSweet = {
      ...sweet,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sweets.set(id, updatedSweet);
    return updatedSweet;
  }
  async deleteSweet(id) {
    return this.sweets.delete(id);
  }
  async searchSweets(query, category, minPrice, maxPrice) {
    let results = Array.from(this.sweets.values());
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (sweet) => sweet.name.toLowerCase().includes(lowerQuery) || sweet.description.toLowerCase().includes(lowerQuery)
      );
    }
    if (category) {
      results = results.filter((sweet) => sweet.category === category);
    }
    if (minPrice !== void 0) {
      results = results.filter((sweet) => parseFloat(sweet.price) >= minPrice);
    }
    if (maxPrice !== void 0) {
      results = results.filter((sweet) => parseFloat(sweet.price) <= maxPrice);
    }
    return results;
  }
  // Order methods
  async createOrder(insertOrder) {
    const id = randomUUID();
    const order = {
      ...insertOrder,
      status: insertOrder.status || "pending",
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, order);
    return order;
  }
  async getOrdersByUser(userId) {
    return Array.from(this.orders.values()).filter((order) => order.userId === userId);
  }
  async addOrderItem(insertOrderItem) {
    const id = randomUUID();
    const orderItem = {
      ...insertOrderItem,
      id
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  // Cart methods
  async getCartItems(userId) {
    const userCartItems = Array.from(this.cartItems.values()).filter((item) => item.userId === userId);
    return userCartItems.map((item) => {
      const sweet = this.sweets.get(item.sweetId);
      if (!sweet) throw new Error(`Sweet not found: ${item.sweetId}`);
      return { ...item, sweet };
    });
  }
  async addToCart(insertCartItem) {
    const existingItem = Array.from(this.cartItems.values()).find((item) => item.userId === insertCartItem.userId && item.sweetId === insertCartItem.sweetId);
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + insertCartItem.quantity
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    const id = randomUUID();
    const cartItem = {
      ...insertCartItem,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  async updateCartItem(id, quantity) {
    const item = this.cartItems.get(id);
    if (!item) return void 0;
    const updatedItem = {
      ...item,
      quantity
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  async removeFromCart(id) {
    return this.cartItems.delete(id);
  }
  async clearCart(userId) {
    const userItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id]) => {
      this.cartItems.delete(id);
    });
  }
  // Purchase and restock methods
  async purchaseSweet(sweetId, quantity) {
    const sweet = this.sweets.get(sweetId);
    if (!sweet || sweet.quantity < quantity) {
      return false;
    }
    const updatedSweet = {
      ...sweet,
      quantity: sweet.quantity - quantity,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sweets.set(sweetId, updatedSweet);
    return true;
  }
  async restockSweet(sweetId, quantity) {
    const sweet = this.sweets.get(sweetId);
    if (!sweet) return false;
    const updatedSweet = {
      ...sweet,
      quantity: sweet.quantity + quantity,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sweets.set(sweetId, updatedSweet);
    return true;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"),
  // 'customer' | 'admin'
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var sweets = pgTable("sweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // 'mithai' | 'laddu' | 'halwa' | 'barfi'
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // 'pending' | 'completed' | 'cancelled'
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  sweetId: varchar("sweet_id").notNull().references(() => sweets.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull()
});
var cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sweetId: varchar("sweet_id").notNull().references(() => sweets.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertSweetSchema = createInsertSchema(sweets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
var searchSweetsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional()
});
var purchaseSchema = z.object({
  quantity: z.number().min(1)
});
var restockSchema = z.object({
  quantity: z.number().min(1)
});

// server/routes.ts
import bcrypt2 from "bcrypt";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt2.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt2.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.get("/api/sweets", async (req, res) => {
    try {
      const sweets2 = await storage.getAllSweets();
      res.json(sweets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sweets" });
    }
  });
  app2.get("/api/sweets/search", async (req, res) => {
    try {
      const { query, category, minPrice, maxPrice } = searchSweetsSchema.parse(req.query);
      const sweets2 = await storage.searchSweets(
        query,
        category,
        minPrice ? parseFloat(minPrice) : void 0,
        maxPrice ? parseFloat(maxPrice) : void 0
      );
      res.json(sweets2);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });
  app2.post("/api/sweets", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const sweetData = insertSweetSchema.parse(req.body);
      const sweet = await storage.createSweet(sweetData);
      res.json(sweet);
    } catch (error) {
      res.status(400).json({ message: "Invalid sweet data" });
    }
  });
  app2.put("/api/sweets/:id", authenticateToken, requireAdmin, async (req, res) => {
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
  app2.delete("/api/sweets/:id", authenticateToken, requireAdmin, async (req, res) => {
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
  app2.post("/api/sweets/:id/purchase", authenticateToken, async (req, res) => {
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
  app2.post("/api/sweets/:id/restock", authenticateToken, requireAdmin, async (req, res) => {
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
  app2.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const cartItems2 = await storage.getCartItems(req.user.id);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart", authenticateToken, async (req, res) => {
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
  app2.delete("/api/cart/:id", authenticateToken, async (req, res) => {
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
  app2.delete("/api/cart", authenticateToken, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(
    port,
    "127.0.0.1",
    () => {
      log(`Server running on http://127.0.0.1:${port}`);
    }
  );
})();
