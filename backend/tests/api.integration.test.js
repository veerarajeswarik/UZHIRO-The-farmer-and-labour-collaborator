/**
 * Integration tests against a real (local) MongoDB, using a dedicated test
 * database (never the dev database) so this suite is safe to run
 * repeatedly without touching real data. Requires a reachable MongoDB -
 * see MONGODB_URI resolution below.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const FarmerProfile = require('../src/models/FarmerProfile');
const LabourerProfile = require('../src/models/LabourerProfile');

const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uzhiro_dev';
const TEST_URI = baseUri.replace(/\/([^/?]+)(\?.*)?$/, '/uzhiro_test$2');

jest.setTimeout(20000);

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
});

afterEach(async () => {
  // Keep the test DB clean between tests so each test starts from a known state.
  await Promise.all([User.deleteMany({}), FarmerProfile.deleteMany({}), LabourerProfile.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const farmerPayload = {
  name: 'Test Farmer',
  phone: '9000000000',
  email: 'test.farmer@example.com',
  password: 'password123',
  location: 'Coimbatore',
  role: 'farmer',
};

const labourerPayload = {
  name: 'Test Labourer',
  phone: '9000000001',
  email: 'test.labourer@example.com',
  password: 'password123',
  location: 'Madurai',
  role: 'labourer',
  workTypes: ['Harvesting'],
  experienceYears: 3,
  dailyWage: 400,
};

describe('POST /api/auth/register', () => {
  test('registers a farmer, hashes the password, and never returns it', async () => {
    const res = await request(app).post('/api/auth/register').send(farmerPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(farmerPayload.email);
    expect(res.body.data.user.password).toBeUndefined();

    const stored = await User.findOne({ email: farmerPayload.email }).select('+password');
    expect(stored.password).not.toBe(farmerPayload.password);
    expect(stored.password.length).toBeGreaterThan(20); // bcrypt hash, not plaintext

    const profile = await FarmerProfile.findOne({ user: stored._id });
    expect(profile).not.toBeNull();
  });

  test('registers a labourer with the labourer-only fields', async () => {
    const res = await request(app).post('/api/auth/register').send(labourerPayload);
    expect(res.status).toBe(201);

    const profile = await LabourerProfile.findOne({ user: res.body.data.user.id });
    expect(profile.workTypes).toEqual(['Harvesting']);
    expect(profile.dailyWage).toBe(400);
  });

  test('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(farmerPayload);
    const res = await request(app).post('/api/auth/register').send(farmerPayload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects role "admin" from the public endpoint', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...farmerPayload, role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('rejects a password shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...farmerPayload, password: '123' });
    expect(res.status).toBe(400);
  });

  test('rejects a labourer registration missing required labourer fields', async () => {
    const { workTypes, experienceYears, dailyWage, ...incomplete } = labourerPayload;
    const res = await request(app).post('/api/auth/register').send(incomplete);
    expect(res.status).toBe(400);
  });

  test('rejects an invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...farmerPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(farmerPayload);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: farmerPayload.email, password: farmerPayload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  test('rejects an incorrect password without revealing which field was wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: farmerPayload.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('rejects a non-existent email with the same generic message (no user enumeration)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('blocks login for a deactivated account', async () => {
    await User.updateOne({ email: farmerPayload.email }, { isActive: false });
    const res = await request(app).post('/api/auth/login').send({ email: farmerPayload.email, password: farmerPayload.password });
    expect(res.status).toBe(403);
  });
});

describe('Authentication & authorization on protected routes', () => {
  async function registerAndLogin(payload) {
    const res = await request(app).post('/api/auth/register').send(payload);
    return res.body.data.token;
  }

  test('rejects a protected route with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('rejects a protected route with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('accepts a protected route with a valid token', async () => {
    const token = await registerAndLogin(farmerPayload);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(farmerPayload.email);
  });

  test('a labourer cannot access a farmer-only route', async () => {
    const token = await registerAndLogin(labourerPayload);
    const res = await request(app).get('/api/farmers/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a farmer cannot access a labourer-only route', async () => {
    const token = await registerAndLogin(farmerPayload);
    const res = await request(app).get('/api/labourers/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a farmer (non-admin) cannot access admin routes', async () => {
    const token = await registerAndLogin(farmerPayload);
    const res = await request(app).get('/api/admin/reports').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('Input sanitization (NoSQL injection hardening)', () => {
  test('a MongoDB operator injected via query string is stripped, not executed', async () => {
    await request(app).post('/api/auth/register').send(farmerPayload);
    const token = (
      await request(app).post('/api/auth/login').send({ email: farmerPayload.email, password: farmerPayload.password })
    ).body.data.token;

    // Attempt to bypass role filtering via a Mongo operator in the query string.
    // express-mongo-sanitize should strip the '$'-prefixed key before it reaches Mongoose.
    const res = await request(app)
      .get('/api/admin/reports')
      .query({ 'role[$ne]': 'nobody' })
      .set('Authorization', `Bearer ${token}`);

    // Still forbidden - a farmer token, regardless of query string tampering.
    expect(res.status).toBe(403);
  });

  test('login request body cannot use a Mongo operator to bypass the password check', async () => {
    await request(app).post('/api/auth/register').send(farmerPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: farmerPayload.email, password: { $ne: null } });
    // express-validator's isEmail/notEmpty on a non-string, or sanitize stripping the
    // operator key, must not result in a successful login.
    expect(res.status).not.toBe(200);
  });
});

describe('GET /api/health', () => {
  test('reports ok status and a connected database in this test run', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.database).toBe('connected');
  });
});
