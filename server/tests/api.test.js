const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const http = require('http');

// Models
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');
const GroceryItem = require('../models/GroceryItem');
const { app } = require('../server');

const JWT_SECRET = 'mealmate_super_secret_jwt_key_ca3_25070521188_secure_2025';

let testServer;
let testBaseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Listen on dynamic random available port for testing
    testServer = app.listen(0, () => {
      const port = testServer.address().port;
      testBaseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
  await mongoose.disconnect();
});

test('1. User Model Schema & Validation', async (t) => {
  await t.test('requires name, email, and password', () => {
    const user = new User({});
    const err = user.validateSync();
    assert.ok(err, 'Expected validation error');
    assert.ok(err.errors.name, 'Expected name error');
    assert.ok(err.errors.email, 'Expected email error');
    assert.ok(err.errors.password, 'Expected password error');
  });

  await t.test('rejects invalid email formats', () => {
    const user = new User({
      name: 'John Doe',
      email: 'invalid-email-address',
      password: 'password123'
    });
    const err = user.validateSync();
    assert.ok(err, 'Expected validation error for bad email');
    assert.ok(err.errors.email, 'Expected email validation error');
  });

  await t.test('enforces minimum 8 characters password in schema', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short'
    });
    const err = user.validateSync();
    assert.ok(err.errors.password, 'Expected short password error');
  });
});

test('2. Password Hashing and Comparison', async (t) => {
  await t.test('hashes password using bcrypt with salt rounds', async () => {
    const plain = 'StrongPass123!';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(plain, salt);

    assert.notEqual(hashed, plain);
    assert.ok(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'));

    const match = await bcrypt.compare(plain, hashed);
    assert.equal(match, true);

    const wrongMatch = await bcrypt.compare('WrongPassword', hashed);
    assert.equal(wrongMatch, false);
  });
});

test('3. JWT Token Generation and Verification', async (t) => {
  const dummyId = new mongoose.Types.ObjectId().toString();

  await t.test('generates valid token with user id payload', () => {
    const token = jwt.sign({ id: dummyId }, JWT_SECRET, { expiresIn: '1h' });
    assert.ok(token);

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.id, dummyId);
  });

  await t.test('rejects forged or tamperered token', () => {
    const fakeSecret = 'tampered_secret_key';
    const fakeToken = jwt.sign({ id: dummyId }, fakeSecret, { expiresIn: '1h' });

    assert.throws(() => {
      jwt.verify(fakeToken, JWT_SECRET);
    });
  });

  await t.test('detects expired tokens', () => {
    const expiredToken = jwt.sign({ id: dummyId }, JWT_SECRET, { expiresIn: '-1s' });
    assert.throws(
      () => {
        jwt.verify(expiredToken, JWT_SECRET);
      },
      (err) => err.name === 'TokenExpiredError'
    );
  });
});

test('4. Recipe Model Schema & Validation', async (t) => {
  const dummyUserId = new mongoose.Types.ObjectId();

  await t.test('requires title, category, ingredients, and instructions', () => {
    const recipe = new Recipe({ user: dummyUserId });
    const err = recipe.validateSync();
    assert.ok(err);
    assert.ok(err.errors.title);
    assert.ok(err.errors.ingredients);
    assert.ok(err.errors.instructions);
  });

  await t.test('accepts structured ingredients and instruction steps', () => {
    const recipe = new Recipe({
      title: 'Avocado Toast with Poached Egg',
      description: 'Quick nutritious breakfast loaded with healthy fats',
      ingredients: [
        { name: 'Sourdough Bread', quantity: '2', unit: 'slices' },
        { name: 'Ripe Avocado', quantity: '1', unit: 'pcs' },
        { name: 'Free-range Eggs', quantity: '2', unit: 'pcs' }
      ],
      instructions: [
        'Toast the sourdough slices until golden brown.',
        'Mash avocado with a pinch of sea salt and pepper.',
        'Poach eggs in simmering water for 3 minutes.',
        'Spread avocado onto toast and top with warm poached eggs.'
      ],
      category: 'Breakfast',
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      user: dummyUserId
    });

    const err = recipe.validateSync();
    assert.equal(err, undefined, 'Recipe should validate cleanly');
    assert.equal(recipe.ingredients.length, 3);
    assert.equal(recipe.instructions.length, 4);
  });

  await t.test('validates enum values for difficulty and category', () => {
    const recipe = new Recipe({
      title: 'Test Recipe',
      category: 'InvalidCategory',
      difficulty: 'Extreme',
      ingredients: [{ name: 'Salt' }],
      instructions: ['Season and serve'],
      user: dummyUserId
    });

    const err = recipe.validateSync();
    assert.ok(err.errors.category);
    assert.ok(err.errors.difficulty);
  });
});

test('5. MealPlan Model Schema & Validation', async (t) => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyRecipeId = new mongoose.Types.ObjectId();

  await t.test('requires user, recipe, date, and mealType', () => {
    const plan = new MealPlan({});
    const err = plan.validateSync();
    assert.ok(err);
    assert.ok(err.errors.user);
    assert.ok(err.errors.recipe);
    assert.ok(err.errors.date);
  });

  await t.test('accepts valid meal plan parameters', () => {
    const plan = new MealPlan({
      user: dummyUserId,
      recipe: dummyRecipeId,
      date: new Date('2026-10-28'),
      mealType: 'Dinner',
      notes: 'Make extra for tomorrow lunch'
    });
    const err = plan.validateSync();
    assert.equal(err, undefined);
  });
});

test('6. GroceryItem Model Schema & Validation', async (t) => {
  const dummyUserId = new mongoose.Types.ObjectId();

  await t.test('requires item name and user', () => {
    const item = new GroceryItem({});
    const err = item.validateSync();
    assert.ok(err);
    assert.ok(err.errors.name);
    assert.ok(err.errors.user);
  });

  await t.test('defaults isPurchased to false', () => {
    const item = new GroceryItem({
      name: 'Organic Spinach',
      quantity: '250',
      unit: 'grams',
      category: 'Produce',
      user: dummyUserId
    });
    const err = item.validateSync();
    assert.equal(err, undefined);
    assert.equal(item.isPurchased, false);
  });
});

test('7. HTTP API Server & Health Check Endpoint', async (t) => {
  await t.test('GET /api/health reports online status and actual database connection status', async () => {
    const res = await fetch(`${testBaseUrl}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'online');
    assert.ok(body.timestamp);
    assert.ok(body.database);
    assert.equal(typeof body.database.connected, 'boolean');
    assert.ok(['connected', 'disconnected', 'connecting'].includes(body.database.status));
  });
});

test('8. HTTP Authentication Middleware & Route Protection', async (t) => {
  await t.test('Protected endpoints reject unauthenticated requests with 401', async () => {
    const endpoints = [
      '/recipes',
      '/meal-plans',
      '/grocery',
      '/dashboard/stats',
      '/auth/me'
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${testBaseUrl}${ep}`);
      assert.equal(res.status, 401, `Expected 401 for ${ep}`);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /not authorized|no token/i);
    }
  });

  await t.test('Protected endpoints reject invalid / malformed token with 401', async () => {
    const res = await fetch(`${testBaseUrl}/recipes`, {
      headers: {
        Authorization: 'Bearer invalid.bogus.token'
      }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /invalid authentication token/i);
  });
});

test('9. HTTP Registration & Login Input Validation', async (t) => {
  await t.test('POST /api/auth/register rejects missing fields with 400', async () => {
    const res = await fetch(`${testBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /please provide/i);
  });

  await t.test('POST /api/auth/register rejects password mismatch with 400', async () => {
    const res = await fetch(`${testBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'MismatchPassword123'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /passwords do not match/i);
  });

  await t.test('POST /api/auth/register rejects short password (< 8 chars) with 400', async () => {
    const res = await fetch(`${testBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /at least 8 characters/i);
  });

  await t.test('POST /api/auth/login rejects empty credentials with 400', async () => {
    const res = await fetch(`${testBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /provide both email/i);
  });
});

test('10. Database Disconnection & Error Handling', async (t) => {
  await t.test('POST /api/auth/register immediately returns 503 without buffering timeout when database is offline', async () => {
    const startTime = Date.now();
    const res = await fetch(`${testBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });

    const elapsed = Date.now() - startTime;
    // Must respond immediately, NOT after 10000ms buffering timeout!
    assert.ok(elapsed < 2000, `Expected immediate response but took ${elapsed}ms`);
    assert.equal(res.status, 503);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /database service is currently unavailable/i);
  });
});
