# Integration Testing Guide

## Table of Contents

1. [Integration Testing Prompt Template](#integration-testing-prompt-template)
2. [Testing Scope:](#testing-scope)
3. [Technical Context:](#technical-context)
4. [Integration Points:](#integration-points)
5. [Test Requirements:](#test-requirements)
6. [Integration Testing Strategies](#integration-testing-strategies)
  7. [1. Component Integration Testing](#1-component-integration-testing)
    8. [React Component Integration](#react-component-integration)
  9. [2. API Integration Testing](#2-api-integration-testing)
    10. [REST API Integration](#rest-api-integration)
  11. [3. Database Integration Testing](#3-database-integration-testing)
    12. [Database Operation Testing](#database-operation-testing)
  13. [4. State Management Integration](#4-state-management-integration)
    14. [Redux Integration Testing](#redux-integration-testing)
  15. [5. End-to-End Workflow Testing](#5-end-to-end-workflow-testing)
    16. [Complete User Journey](#complete-user-journey)
17. [Integration Testing Optimal Practices](#integration-testing-optimal-practices)
  18. [1. Test Environment Setup](#1-test-environment-setup)
    19. [Test Database Management](#test-database-management)
    20. [Test Data Factories](#test-data-factories)
  21. [2. Mock Strategy](#2-mock-strategy)
    22. [Selective Mocking](#selective-mocking)
  23. [3. Integration Test Organization](#3-integration-test-organization)
    24. [Test Suite Structure](#test-suite-structure)
25. [Integration Testing Checklist](#integration-testing-checklist)
  26. [Pre-Test Setup](#pre-test-setup)
  27. [Test Coverage](#test-coverage)
  28. [Test Quality](#test-quality)
  29. [Maintenance](#maintenance)

## Integration Testing Prompt Template

```text
I need to create integration tests for [COMPONENT/FEATURE]. Please help me design comprehensive integration tests:

## Testing Scope:
- [ ] Component integration with APIs
- [ ] Database interactions
- [ ] Third-party service integration
- [ ] Cross-component communication
- [ ] State management integration
- [ ] User workflow testing

## Technical Context:
- Components: [List components being tested]
- APIs: [List APIs being integrated]
- Database: [Database type and models]
- External services: [Third-party integrations]
- State management: [Redux, Context, etc.]

## Integration Points:
- [Describe how components interact]
- [List API endpoints being tested]
- [Mention data flow between components]

## Test Requirements:
- Test framework: [Jest, Cypress, Playwright, etc.]
- Mock strategy: [What to mock vs real integration]
- Test data: [How to handle test data]
- Environment: [Test environment setup]

Please provide integration test examples with setup and teardown strategies.
```

## Integration Testing Strategies

### 1. Component Integration Testing

#### React Component Integration

```typescript
// Component under test
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userAPI.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  if (!user) return <div data-testid="not-found">User not found</div>;

  return (
    <div data-testid="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <UserPosts userId={userId} />
    </div>
  );
};

// Integration test
describe('UserProfile Integration', () => {
  beforeEach(() => {
    // Setup test environment
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    cleanup();
  });

  it('should fetch and display user data', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Mock API response
    jest.spyOn(userAPI, 'getUser').mockResolvedValue(mockUser);

    render(<UserProfile userId="1" />);

    // Verify loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    // Verify user data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    // Verify API was called correctly
    expect(userAPI.getUser).toHaveBeenCalledWith('1');
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch user';
    jest.spyOn(userAPI, 'getUser').mockRejectedValue(new Error(errorMessage));

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should integrate with child components', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const mockPosts = [
      { id: '1', title: 'Post 1', content: 'Content 1' }
    ];

    jest.spyOn(userAPI, 'getUser').mockResolvedValue(mockUser);
    jest.spyOn(userAPI, 'getUserPosts').mockResolvedValue(mockPosts);

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    // Verify child component integration
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });
  });
});
```

### 2. API Integration Testing

#### REST API Integration

```typescript
// API integration tests
describe("User API Integration", () => {
  const baseURL = process.env.TEST_API_URL || "http://localhost:3001";
  let testUserId: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test user
    const testUser = await createTestUser({
      name: "Test User",
      email: "test@example.com",
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await deleteTestUser(testUserId);
  });

  describe("GET /api/users/:id", () => {
    it("should fetch user by id", async () => {
      const response = await fetch(`${baseURL}/api/users/${testUserId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: testUserId,
        name: "Test User",
        email: "test@example.com",
      });
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = "non-existent-id";
      const response = await fetch(`${baseURL}/api/users/${fakeId}`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toContain("not found");
    });
  });

  describe("POST /api/users", () => {
    it("should create new user", async () => {
      const newUser = {
        name: "New User",
        email: "new@example.com",
      };

      const response = await fetch(`${baseURL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject(newUser);
      expect(data.data.id).toBeDefined();

      // Cleanup
      await deleteTestUser(data.data.id);
    });

    it("should validate required fields", async () => {
      const invalidUser = { name: "Test" }; // Missing email

      const response = await fetch(`${baseURL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUser),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
    });
  });
});
```

### 3. Database Integration Testing

#### Database Operation Testing

```typescript
// Database integration tests
describe("User Database Integration", () => {
  let db: Database;
  let userRepository: UserRepository;

  beforeAll(async () => {
    // Setup test database connection
    db = await createTestDatabase();
    userRepository = new UserRepository(db);
  });

  afterAll(async () => {
    // Close database connection
    await db.close();
  });

  beforeEach(async () => {
    // Clear test data
    await db.query("DELETE FROM users WHERE email LIKE ?", ["%test.com"]);
  });

  describe("User CRUD Operations", () => {
    it("should create and retrieve user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@test.com",
        age: 30,
      };

      // Create user
      const createdUser = await userRepository.create(userData);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe(userData.name);

      // Retrieve user
      const retrievedUser = await userRepository.findById(createdUser.id);
      expect(retrievedUser).toMatchObject(userData);
    });

    it("should update user data", async () => {
      const user = await userRepository.create({
        name: "John Doe",
        email: "john@test.com",
        age: 30,
      });

      const updateData = { name: "Jane Doe", age: 31 };
      const updatedUser = await userRepository.update(user.id, updateData);

      expect(updatedUser.name).toBe("Jane Doe");
      expect(updatedUser.age).toBe(31);
      expect(updatedUser.email).toBe("john@test.com"); // Unchanged
    });

    it("should delete user", async () => {
      const user = await userRepository.create({
        name: "John Doe",
        email: "john@test.com",
        age: 30,
      });

      await userRepository.delete(user.id);

      const deletedUser = await userRepository.findById(user.id);
      expect(deletedUser).toBeNull();
    });

    it("should handle database constraints", async () => {
      const userData = {
        name: "John Doe",
        email: "john@test.com",
        age: 30,
      };

      await userRepository.create(userData);

      // Try to create duplicate email
      await expect(
        userRepository.create({ ...userData, name: "Different Name" }),
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("Complex Queries", () => {
    beforeEach(async () => {
      // Setup test data
      await Promise.all([
        userRepository.create({
          name: "Alice",
          email: "alice@test.com",
          age: 25,
        }),
        userRepository.create({ name: "Bob", email: "bob@test.com", age: 35 }),
        userRepository.create({
          name: "Charlie",
          email: "charlie@test.com",
          age: 45,
        }),
      ]);
    });

    it("should find users by age range", async () => {
      const users = await userRepository.findByAgeRange(30, 50);

      expect(users).toHaveLength(2);
      expect(users.map((u) => u.name)).toEqual(["Bob", "Charlie"]);
    });

    it("should search users by name", async () => {
      const users = await userRepository.searchByName("li");

      expect(users).toHaveLength(2);
      expect(users.map((u) => u.name)).toEqual(["Alice", "Charlie"]);
    });
  });
});
```

### 4. State Management Integration

#### Redux Integration Testing

```typescript
// Redux integration tests
describe("User State Integration", () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it("should handle complete user fetch flow", async () => {
    const mockUser = { id: "1", name: "John Doe", email: "john@example.com" };

    // Mock API
    jest.spyOn(userAPI, "getUser").mockResolvedValue(mockUser);

    // Dispatch fetch action
    await store.dispatch(fetchUser("1"));

    const state = store.getState();

    expect(state.user.loading).toBe(false);
    expect(state.user.data).toEqual(mockUser);
    expect(state.user.error).toBeNull();
  });

  it("should handle user update flow", async () => {
    const initialUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    };
    const updatedUser = { ...initialUser, name: "Jane Doe" };

    // Setup initial state
    store.dispatch(setUser(initialUser));

    // Mock API
    jest.spyOn(userAPI, "updateUser").mockResolvedValue(updatedUser);

    // Dispatch update action
    await store.dispatch(updateUser("1", { name: "Jane Doe" }));

    const state = store.getState();

    expect(state.user.data.name).toBe("Jane Doe");
    expect(userAPI.updateUser).toHaveBeenCalledWith("1", { name: "Jane Doe" });
  });

  it("should handle error states", async () => {
    const errorMessage = "Failed to fetch user";

    jest.spyOn(userAPI, "getUser").mockRejectedValue(new Error(errorMessage));

    await store.dispatch(fetchUser("1"));

    const state = store.getState();

    expect(state.user.loading).toBe(false);
    expect(state.user.data).toBeNull();
    expect(state.user.error).toBe(errorMessage);
  });
});
```

### 5. End-to-End Workflow Testing

#### Complete User Journey

```typescript
// E2E workflow integration test
describe("User Registration Workflow", () => {
  beforeEach(async () => {
    // Setup clean test environment
    await clearTestDatabase();
    await clearTestCache();
  });

  it("should complete full user registration workflow", async () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "securePassword123",
    };

    // Step 1: User registration
    const registrationResponse = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    expect(registrationResponse.body.success).toBe(true);
    const userId = registrationResponse.body.data.id;

    // Step 2: Email verification (simulate)
    const verificationToken = await getVerificationToken(userId);

    await request(app)
      .post("/api/auth/verify-email")
      .send({ token: verificationToken })
      .expect(200);

    // Step 3: User login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    const authToken = loginResponse.body.data.token;

    // Step 4: Access protected resource
    const profileResponse = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.data.email).toBe(userData.email);
    expect(profileResponse.body.data.emailVerified).toBe(true);

    // Step 5: Update profile
    const updateData = { name: "Jane Doe" };

    await request(app)
      .put("/api/user/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    // Step 6: Verify update
    const updatedProfileResponse = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(updatedProfileResponse.body.data.name).toBe("Jane Doe");
  });
});
```

## Integration Testing Optimal Practices

### 1. Test Environment Setup

#### Test Database Management

```typescript
// Test database utilities
export class TestDatabase {
  private static instance: Database;

  static async setup() {
    if (!this.instance) {
      this.instance = await createDatabase({
        host: process.env.TEST_DB_HOST,
        database: process.env.TEST_DB_NAME,
        user: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
      });
    }

    await this.runMigrations();
    return this.instance;
  }

  static async teardown() {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
    }
  }

  static async seedData() {
    const seedData = await loadSeedData();
    await this.instance.transaction(async (trx) => {
      for (const table of Object.keys(seedData)) {
        await trx(table).insert(seedData[table]);
      }
    });
  }

  static async clearData() {
    const tables = ["users", "posts", "comments"]; // Order matters for FK constraints

    await this.instance.transaction(async (trx) => {
      for (const table of tables.reverse()) {
        await trx(table).del();
      }
    });
  }

  private static async runMigrations() {
    await this.instance.migrate.latest();
  }
}
```

#### Test Data Factories

```typescript
// Test data factories
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: generateId(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      age: faker.datatype.number({ min: 18, max: 80 }),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static async persist(user: Partial<User> = {}): Promise<User> {
    const userData = this.create(user);
    return await userRepository.create(userData);
  }
}

// Usage in tests
describe("User Integration Tests", () => {
  it("should handle user relationships", async () => {
    // Create test users
    const author = await UserFactory.persist({ name: "Author User" });
    const commenter = await UserFactory.persist({ name: "Commenter User" });

    // Create related data
    const post = await PostFactory.persist({ authorId: author.id });
    const comment = await CommentFactory.persist({
      postId: post.id,
      authorId: commenter.id,
    });

    // Test relationships
    const postWithComments = await postRepository.findWithComments(post.id);
    expect(postWithComments.comments).toHaveLength(1);
    expect(postWithComments.comments[0].author.name).toBe("Commenter User");
  });
});
```

### 2. Mock Strategy

#### Selective Mocking

```typescript
// Integration test with selective mocking
describe("Order Processing Integration", () => {
  beforeEach(() => {
    // Mock external services but keep internal integration
    jest.mock("../services/paymentService", () => ({
      processPayment: jest
        .fn()
        .mockResolvedValue({ success: true, transactionId: "test-123" }),
    }));

    jest.mock("../services/emailService", () => ({
      sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    }));

    // Keep real database integration
    // Keep real internal service integration
  });

  it("should process order end-to-end", async () => {
    const order = {
      items: [{ productId: "1", quantity: 2, price: 100 }],
      customerId: "customer-1",
      shippingAddress: {
        /* address data */
      },
    };

    const result = await orderService.processOrder(order);

    // Verify order was saved to database (real integration)
    const savedOrder = await orderRepository.findById(result.orderId);
    expect(savedOrder).toBeDefined();

    // Verify inventory was updated (real integration)
    const product = await productRepository.findById("1");
    expect(product.stock).toBe(product.stock - 2);

    // Verify external services were called (mocked)
    expect(paymentService.processPayment).toHaveBeenCalled();
    expect(emailService.sendOrderConfirmation).toHaveBeenCalled();
  });
});
```

### 3. Integration Test Organization

#### Test Suite Structure

```typescript
// Organized integration test suite
describe("User Management Integration", () => {
  // Shared setup
  let testDb: TestDatabase;
  let userRepository: UserRepository;
  let emailService: EmailService;

  beforeAll(async () => {
    testDb = await TestDatabase.setup();
    userRepository = new UserRepository(testDb);
    emailService = new EmailService();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.clearData();
  });

  describe("User Registration", () => {
    it("should register new user with email verification", async () => {
      // Test implementation
    });

    it("should prevent duplicate email registration", async () => {
      // Test implementation
    });
  });

  describe("User Authentication", () => {
    beforeEach(async () => {
      // Setup authenticated user context
      const testUser = await UserFactory.persist({ emailVerified: true });
      authToken = generateAuthToken(testUser);
    });

    it("should authenticate with valid credentials", async () => {
      // Test implementation
    });

    it("should reject invalid credentials", async () => {
      // Test implementation
    });
  });

  describe("User Profile Management", () => {
    // Profile-specific tests
  });
});
```

## Integration Testing Checklist

### Pre-Test Setup

- [ ] **Test Environment**: Isolated test environment configured
- [ ] **Test Database**: Separate test database with migrations
- [ ] **Mock Strategy**: External dependencies mocked appropriately
- [ ] **Test Data**: Factories and seeds created
- [ ] **Cleanup Strategy**: Proper cleanup between tests

### Test Coverage

- [ ] **API Integration**: All API endpoints tested
- [ ] **Database Integration**: CRUD operations tested
- [ ] **Service Integration**: Service interactions tested
- [ ] **State Management**: State updates tested
- [ ] **Error Handling**: Error scenarios covered
- [ ] **Edge Cases**: Boundary conditions tested

### Test Quality

- [ ] **Isolation**: Tests don't depend on each other
- [ ] **Deterministic**: Tests produce consistent results
- [ ] **Fast Execution**: Tests run efficiently
- [ ] **Clear Assertions**: Test expectations are explicit
- [ ] **Good Coverage**: Critical integration points covered

### Maintenance

- [ ] **Documentation**: Test purpose and setup documented
- [ ] **CI Integration**: Tests run in continuous integration
- [ ] **Monitoring**: Test failures are monitored
- [ ] **Regular Updates**: Tests updated with code changes
