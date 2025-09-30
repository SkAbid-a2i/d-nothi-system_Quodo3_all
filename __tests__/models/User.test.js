const sequelize = require('../../config/database');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Use a test database
    process.env.DB_NAME = 'd_nothi_test_db';
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear the users table before each test
    await User.destroy({ where: {} });
  });

  it('should create a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'Agent',
    };

    const user = await User.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.fullName).toBe(userData.fullName);
    expect(user.role).toBe(userData.role);
    expect(user.isActive).toBe(true);
  });

  it('should hash the password before saving', async () => {
    const userData = {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
      fullName: 'Test User 2',
      role: 'Admin',
    };

    const user = await User.create(userData);
    
    expect(user.password).not.toBe(userData.password);
    const isMatch = await user.comparePassword(userData.password);
    expect(isMatch).toBe(true);
  });

  it('should fail to create a user with duplicate username', async () => {
    const userData1 = {
      username: 'testuser',
      email: 'test1@example.com',
      password: 'password123',
      fullName: 'Test User 1',
      role: 'Agent',
    };

    const userData2 = {
      username: 'testuser',
      email: 'test2@example.com',
      password: 'password123',
      fullName: 'Test User 2',
      role: 'Agent',
    };

    await User.create(userData1);
    
    await expect(User.create(userData2)).rejects.toThrow();
  });
});