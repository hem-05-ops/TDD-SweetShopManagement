import { type User, type InsertUser, type Sweet, type InsertSweet, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type CartItem, type InsertCartItem } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sweet methods
  getAllSweets(): Promise<Sweet[]>;
  getSweet(id: string): Promise<Sweet | undefined>;
  createSweet(sweet: InsertSweet): Promise<Sweet>;
  updateSweet(id: string, sweet: Partial<InsertSweet>): Promise<Sweet | undefined>;
  deleteSweet(id: string): Promise<boolean>;
  searchSweets(query?: string, category?: string, minPrice?: number, maxPrice?: number): Promise<Sweet[]>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Cart methods
  getCartItems(userId: string): Promise<(CartItem & { sweet: Sweet })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<void>;

  // Purchase method
  purchaseSweet(sweetId: string, quantity: number): Promise<boolean>;
  restockSweet(sweetId: string, quantity: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sweets: Map<string, Sweet>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.users = new Map();
    this.sweets = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample users with hashed passwords
    
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser: User = {
      id: "admin-user-id",
      username: "admin",
      email: "admin@sweetshop.com",
      password: adminPassword,
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customerUser: User = {
      id: "customer-user-id", 
      username: "customer",
      email: "customer@sweetshop.com",
      password: customerPassword,
      role: "customer",
      createdAt: new Date(),
    };
    this.users.set(customerUser.id, customerUser);

    // Sample sweets data
    const sampleSweets: Sweet[] = [
      {
        id: "1",
        name: "Gulab Jamun",
        category: "mithai",
        description: "Soft, spongy milk-solid balls soaked in aromatic sugar syrup",
        price: "180.00",
        quantity: 25,
        imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?ixlib=rb-4.0.3&w=600&h=400",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Kaju Katli",
        category: "barfi",
        description: "Premium cashew-based diamond-shaped delicacy with silver foil",
        price: "450.00",
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&w=600&h=400",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Besan Laddu",
        category: "laddu",
        description: "Traditional gram flour balls with ghee and cardamom",
        price: "120.00",
        quantity: 40,
        imageUrl: "https://pixabay.com/get/g08318f2ba80e37ba18d8e5b6c5139b06e77f14423b81e09fda7614a054162cc80785668b5f7ed3ac3482407b77f23f8fb9b14d1d96f894da242f76df314c5685_1280.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        name: "Gajar Halwa",
        category: "halwa",
        description: "Rich carrot-based dessert with milk, nuts and cardamom",
        price: "200.00",
        quantity: 0,
        imageUrl: "https://pixabay.com/get/g0a31c40ceb154783afe73d8d1940a2f0b04549e787fb264d584be15c855008552df965bc26af71c9ef56ff8d00921402e91e21b900fe319f3a8aa51a968f1ee2_1280.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleSweets.forEach(sweet => {
      this.sweets.set(sweet.id, sweet);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "customer",
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Sweet methods
  async getAllSweets(): Promise<Sweet[]> {
    return Array.from(this.sweets.values());
  }

  async getSweet(id: string): Promise<Sweet | undefined> {
    return this.sweets.get(id);
  }

  async createSweet(insertSweet: InsertSweet): Promise<Sweet> {
    const id = randomUUID();
    const sweet: Sweet = {
      ...insertSweet,
      quantity: insertSweet.quantity || 0,
      imageUrl: insertSweet.imageUrl || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sweets.set(id, sweet);
    return sweet;
  }

  async updateSweet(id: string, updates: Partial<InsertSweet>): Promise<Sweet | undefined> {
    const sweet = this.sweets.get(id);
    if (!sweet) return undefined;

    const updatedSweet: Sweet = {
      ...sweet,
      ...updates,
      updatedAt: new Date(),
    };
    this.sweets.set(id, updatedSweet);
    return updatedSweet;
  }

  async deleteSweet(id: string): Promise<boolean> {
    return this.sweets.delete(id);
  }

  async searchSweets(query?: string, category?: string, minPrice?: number, maxPrice?: number): Promise<Sweet[]> {
    let results = Array.from(this.sweets.values());

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(sweet => 
        sweet.name.toLowerCase().includes(lowerQuery) ||
        sweet.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (category) {
      results = results.filter(sweet => sweet.category === category);
    }

    if (minPrice !== undefined) {
      results = results.filter(sweet => parseFloat(sweet.price) >= minPrice);
    }

    if (maxPrice !== undefined) {
      results = results.filter(sweet => parseFloat(sweet.price) <= maxPrice);
    }

    return results;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      status: insertOrder.status || "pending",
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<(CartItem & { sweet: Sweet })[]> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    return userCartItems.map(item => {
      const sweet = this.sweets.get(item.sweetId);
      if (!sweet) throw new Error(`Sweet not found: ${item.sweetId}`);
      return { ...item, sweet };
    });
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.userId === insertCartItem.userId && item.sweetId === insertCartItem.sweetId);

    if (existingItem) {
      // Update quantity
      const updatedItem: CartItem = {
        ...existingItem,
        quantity: existingItem.quantity + insertCartItem.quantity,
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    const updatedItem: CartItem = {
      ...item,
      quantity,
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    const userItems = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId);
    
    userItems.forEach(([id]) => {
      this.cartItems.delete(id);
    });
  }

  // Purchase and restock methods
  async purchaseSweet(sweetId: string, quantity: number): Promise<boolean> {
    const sweet = this.sweets.get(sweetId);
    if (!sweet || sweet.quantity < quantity) {
      return false;
    }

    const updatedSweet: Sweet = {
      ...sweet,
      quantity: sweet.quantity - quantity,
      updatedAt: new Date(),
    };
    this.sweets.set(sweetId, updatedSweet);
    return true;
  }

  async restockSweet(sweetId: string, quantity: number): Promise<boolean> {
    const sweet = this.sweets.get(sweetId);
    if (!sweet) return false;

    const updatedSweet: Sweet = {
      ...sweet,
      quantity: sweet.quantity + quantity,
      updatedAt: new Date(),
    };
    this.sweets.set(sweetId, updatedSweet);
    return true;
  }
}

export const storage = new MemStorage();
