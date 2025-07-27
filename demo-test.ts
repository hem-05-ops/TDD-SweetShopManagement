#!/usr/bin/env tsx

/**
 * Sweet Shop Management System - API Testing Demo
 * 
 * This script demonstrates the full functionality of the Sweet Shop API
 * following TDD principles with comprehensive test coverage.
 */

import { execSync } from 'child_process';

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class SweetShopTester {
  private results: TestResult[] = [];
  private adminToken: string = '';
  private customerToken: string = '';

  async runAllTests(): Promise<void> {
    console.log('🍬 Sweet Shop Management System - TDD Testing Demo');
    console.log('=' .repeat(60));
    console.log('');

    // Wait for server to be ready
    await this.waitForServer();

    // Run test suites in order
    await this.testAuthentication();
    await this.testSweetsManagement();
    await this.testCartFunctionality();
    await this.testInventoryManagement();

    // Print summary
    this.printSummary();
  }

  private async waitForServer(maxRetries = 10): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/sweets`);
        if (response.ok) {
          console.log('✅ Server is ready\n');
          return;
        }
      } catch (error) {
        console.log(`⏳ Waiting for server... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Server not responding');
  }

  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication System');
    console.log('-'.repeat(40));

    // Test login with pre-created admin user and get token
    await this.runTest('Login - Pre-existing Admin', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@sweetshop.com',
          password: 'admin123'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Login failed: ${data.message || response.statusText}`);
      if (data.user.role !== 'admin') throw new Error('Incorrect user role');
      if (!data.token) throw new Error('No token received');
      
      this.adminToken = data.token;
      console.log(`    ✅ Admin login successful with token: ${data.token.substring(0, 20)}...`);
    });

    // Test login with pre-created customer user and get token
    await this.runTest('Login - Pre-existing Customer', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'customer@sweetshop.com',
          password: 'customer123'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Login failed: ${data.message || response.statusText}`);
      if (data.user.role !== 'customer') throw new Error('Incorrect user role');
      if (!data.token) throw new Error('No token received');
      
      this.customerToken = data.token;
      console.log(`    ✅ Customer login successful with token: ${data.token.substring(0, 20)}...`);
    });

    // Test user registration
    await this.runTest('User Registration - New User', async () => {
      const uniqueEmail = `test_${Date.now()}@sweetshop.com`;
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `test_user_${Date.now()}`,
          email: uniqueEmail,
          password: 'password123',
          role: 'customer'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Registration failed: ${data.message || response.statusText}`);
      if (!data.token) throw new Error('No token received');
      if (!data.user) throw new Error('No user data received');
      
      console.log(`    ✅ New user registered successfully`);
    });

    // Test invalid login
    await this.runTest('Invalid Login Rejection', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
      });

      if (response.ok) throw new Error('Invalid login should have been rejected');
      console.log(`    ✅ Invalid login properly rejected`);
    });

    console.log('');
  }

  private async testSweetsManagement(): Promise<void> {
    console.log('🍭 Testing Sweets Management');
    console.log('-'.repeat(40));

    let newSweetId: string;

    // Test getting all sweets
    await this.runTest('Fetch All Sweets', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets`);
      const sweets = await response.json();
      
      if (!response.ok) throw new Error('Failed to fetch sweets');
      if (!Array.isArray(sweets)) throw new Error('Sweets response is not an array');
      if (sweets.length === 0) throw new Error('No sweets found');
      
      console.log(`    ✅ Found ${sweets.length} sweets in inventory`);
    });

    // Test sweet creation (admin only)
    await this.runTest('Create New Sweet (Admin)', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminToken}`
        },
        body: JSON.stringify({
          name: 'Test Mithai',
          category: 'mithai',
          description: 'Test sweet for demonstration',
          price: '199.99',
          quantity: 50,
          imageUrl: 'https://example.com/test-mithai.jpg'
        })
      });

      const sweet = await response.json();
      if (!response.ok) throw new Error(`Sweet creation failed: ${sweet.message || response.statusText}`);
      if (!sweet.id) throw new Error('No sweet ID returned');
      
      newSweetId = sweet.id;
      console.log(`    ✅ New sweet created with ID: ${newSweetId}`);
    });

    // Test unauthorized sweet creation
    await this.runTest('Unauthorized Sweet Creation (Customer)', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customerToken}`
        },
        body: JSON.stringify({
          name: 'Unauthorized Sweet',
          category: 'mithai',
          description: 'Should not be created',
          price: '100.00',
          quantity: 10
        })
      });

      if (response.ok) throw new Error('Customer should not be able to create sweets');
      console.log(`    ✅ Customer sweet creation properly blocked`);
    });

    // Test sweet search
    await this.runTest('Search Sweets by Name', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets/search?query=Gulab`);
      const results = await response.json();
      
      if (!response.ok) throw new Error('Search failed');
      if (!Array.isArray(results)) throw new Error('Search results not an array');
      
      console.log(`    ✅ Search returned ${results.length} results for "Gulab"`);
    });

    console.log('');
  }

  private async testCartFunctionality(): Promise<void> {
    console.log('🛒 Testing Shopping Cart');
    console.log('-'.repeat(40));

    let cartItemId: string;

    // Get a sweet to add to cart
    const sweetsResponse = await fetch(`${API_BASE_URL}/sweets`);
    const sweets = await sweetsResponse.json();
    const sweetId = sweets[0].id;

    // Test adding to cart
    await this.runTest('Add Item to Cart', async () => {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customerToken}`
        },
        body: JSON.stringify({
          sweetId: sweetId,
          quantity: 3
        })
      });

      const cartItem = await response.json();
      if (!response.ok) throw new Error(`Add to cart failed: ${cartItem.message || response.statusText}`);
      if (!cartItem.id) throw new Error('No cart item ID returned');
      
      cartItemId = cartItem.id;
      console.log(`    ✅ Added ${cartItem.quantity} items to cart`);
    });

    // Test getting cart items
    await this.runTest('Get Cart Items', async () => {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${this.customerToken}` }
      });

      const cartItems = await response.json();
      if (!response.ok) throw new Error('Failed to get cart items');
      if (!Array.isArray(cartItems)) throw new Error('Cart items not an array');
      if (cartItems.length === 0) throw new Error('Cart should not be empty');
      
      console.log(`    ✅ Retrieved ${cartItems.length} cart items`);
    });

    // Test unauthorized cart access
    await this.runTest('Unauthorized Cart Access', async () => {
      const response = await fetch(`${API_BASE_URL}/cart`);
      
      if (response.ok) throw new Error('Cart access should require authentication');
      console.log(`    ✅ Cart access properly protected`);
    });

    console.log('');
  }

  private async testInventoryManagement(): Promise<void> {
    console.log('📦 Testing Inventory Management');
    console.log('-'.repeat(40));

    // Get a sweet for testing
    const sweetsResponse = await fetch(`${API_BASE_URL}/sweets`);
    const sweets = await sweetsResponse.json();
    const sweetId = sweets[0].id;
    const originalQuantity = sweets[0].quantity;

    // Test purchase (decreases inventory)
    await this.runTest('Purchase Sweet (Inventory Decrease)', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets/${sweetId}/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customerToken}`
        },
        body: JSON.stringify({ quantity: 2 })
      });

      if (!response.ok) throw new Error('Purchase failed');
      
      // Verify inventory decreased
      const updatedResponse = await fetch(`${API_BASE_URL}/sweets`);
      const updatedSweets = await updatedResponse.json();
      const updatedSweet = updatedSweets.find((s: any) => s.id === sweetId);
      
      if (updatedSweet.quantity !== originalQuantity - 2) {
        throw new Error(`Inventory not updated correctly: expected ${originalQuantity - 2}, got ${updatedSweet.quantity}`);
      }
      
      console.log(`    ✅ Purchased 2 items, inventory: ${originalQuantity} → ${updatedSweet.quantity}`);
    });

    // Test restocking (admin only)
    await this.runTest('Restock Sweet (Admin Only)', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets/${sweetId}/restock`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminToken}`
        },
        body: JSON.stringify({ quantity: 10 })
      });

      if (!response.ok) throw new Error('Restocking failed');
      
      // Verify inventory increased
      const updatedResponse = await fetch(`${API_BASE_URL}/sweets`);
      const updatedSweets = await updatedResponse.json();
      const updatedSweet = updatedSweets.find((s: any) => s.id === sweetId);
      
      console.log(`    ✅ Restocked 10 items, new inventory: ${updatedSweet.quantity}`);
    });

    // Test unauthorized restocking
    await this.runTest('Unauthorized Restocking (Customer)', async () => {
      const response = await fetch(`${API_BASE_URL}/sweets/${sweetId}/restock`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customerToken}`
        },
        body: JSON.stringify({ quantity: 5 })
      });

      if (response.ok) throw new Error('Customer should not be able to restock');
      console.log(`    ✅ Customer restocking properly blocked`);
    });

    console.log('');
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.results.push({ name, passed: true });
    } catch (error) {
      this.results.push({ 
        name, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`    ❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private printSummary(): void {
    console.log('📊 Test Summary');
    console.log('=' .repeat(60));
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    console.log('');

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.error}`);
        });
      console.log('');
    }

    if (passed === this.results.length) {
      console.log('🎉 All tests passed! Sweet Shop Management System is working perfectly.');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please review the issues above.`);
    }
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SweetShopTester();
  tester.runAllTests().catch(console.error);
}