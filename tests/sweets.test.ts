import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Sweets API', () => {
  let app: express.Application;
  let server: any;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);

    // Register and login as admin
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin_test',
        email: 'admin_test@example.com',
        password: 'password123',
        role: 'admin'
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin_test@example.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.token;

    // Register and login as customer
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'customer_test',
        email: 'customer_test@example.com',
        password: 'password123',
        role: 'customer'
      });

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer_test@example.com',
        password: 'password123'
      });
    customerToken = customerLogin.body.token;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check sample data structure
      const sweet = response.body[0];
      expect(sweet).toHaveProperty('id');
      expect(sweet).toHaveProperty('name');
      expect(sweet).toHaveProperty('category');
      expect(sweet).toHaveProperty('price');
      expect(sweet).toHaveProperty('quantity');
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?query=Gulab')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((sweet: any) => {
        expect(sweet.name.toLowerCase()).toContain('gulab');
      });
    });

    it('should filter sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=mithai')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((sweet: any) => {
        expect(sweet.category).toBe('mithai');
      });
    });

    it('should filter sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=100&maxPrice=200')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((sweet: any) => {
        const price = parseFloat(sweet.price);
        expect(price).toBeGreaterThanOrEqual(100);
        expect(price).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('POST /api/sweets', () => {
    it('should create sweet as admin', async () => {
      const sweetData = {
        name: 'Test Laddu',
        category: 'laddu',
        description: 'Test description for laddu',
        price: '150.00',
        quantity: 20,
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(sweetData.name);
      expect(response.body.category).toBe(sweetData.category);
      expect(response.body.price).toBe(sweetData.price);
    });

    it('should reject sweet creation without admin role', async () => {
      const sweetData = {
        name: 'Unauthorized Sweet',
        category: 'mithai',
        description: 'Should not be created',
        price: '100.00',
        quantity: 10
      };

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(sweetData)
        .expect(403);
    });

    it('should reject sweet creation without authentication', async () => {
      const sweetData = {
        name: 'No Auth Sweet',
        category: 'mithai',
        description: 'Should not be created',
        price: '100.00',
        quantity: 10
      };

      await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);
    });

    it('should reject sweet creation with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        category: 'invalid_category',
        description: 'Test',
        price: 'invalid_price',
        quantity: -5 // Negative quantity
      };

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: string;

    beforeAll(async () => {
      // Create a sweet for purchase testing
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Purchase Test Sweet',
          category: 'mithai',
          description: 'For purchase testing',
          price: '100.00',
          quantity: 10
        });
      sweetId = response.body.id;
    });

    it('should purchase sweet successfully', async () => {
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 2 })
        .expect(200);

      // Verify quantity decreased
      const sweetsResponse = await request(app).get('/api/sweets');
      const sweet = sweetsResponse.body.find((s: any) => s.id === sweetId);
      expect(sweet.quantity).toBe(8); // 10 - 2 = 8
    });

    it('should reject purchase without authentication', async () => {
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 1 })
        .expect(401);
    });

    it('should reject purchase with insufficient stock', async () => {
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 20 }) // More than available (8)
        .expect(400);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: string;

    beforeAll(async () => {
      // Get an existing sweet for restock testing
      const sweetsResponse = await request(app).get('/api/sweets');
      sweetId = sweetsResponse.body[0].id;
    });

    it('should restock sweet as admin', async () => {
      const originalResponse = await request(app).get('/api/sweets');
      const originalSweet = originalResponse.body.find((s: any) => s.id === sweetId);
      const originalQuantity = originalSweet.quantity;

      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 })
        .expect(200);

      // Verify quantity increased
      const updatedResponse = await request(app).get('/api/sweets');
      const updatedSweet = updatedResponse.body.find((s: any) => s.id === sweetId);
      expect(updatedSweet.quantity).toBe(originalQuantity + 5);
    });

    it('should reject restock without admin role', async () => {
      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 5 })
        .expect(403);
    });

    it('should reject restock without authentication', async () => {
      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 5 })
        .expect(401);
    });
  });
});