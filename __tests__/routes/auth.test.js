const request = require('supertest');
const sequelize = require('../../config/database');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Use a test database
    process.env.DB_NAME = 'd_nothi_test_db';
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear the users table before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'Agent',
      });

      // Test login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should fail to login with invalid credentials', async () => {
      // Test login with wrong password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(400);

      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with non-existent user', async () => {
      // Test login with non-existent user
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(400);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data for authenticated user', async () => {
      // Create a test user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'Agent',
      });

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const token = loginRes.body.token;

      // Test getting current user
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.username).toBe('testuser');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.fullName).toBe('Test User');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });
});