import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Cart API', () => {
  let app: express.Application;
  let server: any;
  let customerToken: string;
  let sweetId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);

    // Register and login as customer
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'cart_customer',
        email: 'cart_customer@example.com',
        password: 'password123',
        role: 'customer'
      });

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'cart_customer@example.com',
        password: 'password123'
      });
    customerToken = customerLogin.body.token;

    // Get a sweet ID for testing
    const sweetsResponse = await request(app).get('/api/sweets');
    sweetId = sweetsResponse.body[0].id;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/cart', () => {
    it('should add item to cart successfully', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sweetId: sweetId,
          quantity: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.sweetId).toBe(sweetId);
      expect(response.body.quantity).toBe(2);
    });

    it('should reject adding to cart without authentication', async () => {
      await request(app)
        .post('/api/cart')
        .send({
          sweetId: sweetId,
          quantity: 1
        })
        .expect(401);
    });

    it('should reject adding to cart with invalid data', async () => {
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sweetId: 'invalid-id',
          quantity: -1
        })
        .expect(400);
    });
  });

  describe('GET /api/cart', () => {
    beforeAll(async () => {
      // Ensure cart has items
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sweetId: sweetId,
          quantity: 1
        });
    });

    it('should get cart items successfully', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const cartItem = response.body[0];
      expect(cartItem).toHaveProperty('id');
      expect(cartItem).toHaveProperty('quantity');
      expect(cartItem).toHaveProperty('sweet');
      expect(cartItem.sweet).toHaveProperty('name');
      expect(cartItem.sweet).toHaveProperty('price');
    });

    it('should reject getting cart without authentication', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);
    });
  });

  describe('DELETE /api/cart/:id', () => {
    let cartItemId: string;

    beforeAll(async () => {
      // Add item to cart
      const addResponse = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sweetId: sweetId,
          quantity: 1
        });
      
      // Get cart to find the item ID
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      
      cartItemId = cartResponse.body[0].id;
    });

    it('should remove item from cart successfully', async () => {
      await request(app)
        .delete(`/api/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      // Verify item removed
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      
      const removedItem = cartResponse.body.find((item: any) => item.id === cartItemId);
      expect(removedItem).toBeUndefined();
    });

    it('should reject removing item without authentication', async () => {
      await request(app)
        .delete(`/api/cart/${cartItemId}`)
        .expect(401);
    });
  });

  describe('DELETE /api/cart', () => {
    beforeAll(async () => {
      // Add some items to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sweetId: sweetId,
          quantity: 2
        });
    });

    it('should clear cart successfully', async () => {
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      // Verify cart is empty
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(cartResponse.body).toHaveLength(0);
    });

    it('should reject clearing cart without authentication', async () => {
      await request(app)
        .delete('/api/cart')
        .expect(401);
    });
  });
});