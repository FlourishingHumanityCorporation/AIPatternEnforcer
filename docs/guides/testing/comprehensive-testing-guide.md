# Comprehensive Testing Guide

## Purpose

This guide provides practical, battle-tested patterns for testing in local development environments. It focuses on fast feedback loops, maintainable test suites, and AI-assisted test generation.

## Quick Start

```bash
# Install testing dependencies (Node.js example)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @playwright/test

# Create test structure
mkdir -p tests/{unit,integration,e2e}
mkdir -p tests/fixtures
mkdir -p tests/helpers

# Run tests
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:watch    # Watch mode
```

## Testing Philosophy for Local Development

### Core Principles

1. **Fast Feedback** - Tests should run in seconds, not minutes
2. **Isolated** - Tests shouldn't depend on external services
3. **Deterministic** - Same input = same output, always
4. **Readable** - Tests document behavior
5. **Maintainable** - Easy to update when code changes

## Testing Pyramid for Local Projects

```
         /\
        /E2E\        (5-10%) - Critical user journeys
       /------\
      /Integration\  (20-30%) - API and database tests
     /------------\
    /   Unit Tests  \ (60-70%) - Business logic, utilities
   /________________\
```

## Unit Testing Patterns

### Basic Unit Test Structure

```typescript
// user.service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "./user.service";
import { db } from "./db";

// Mock external dependencies
vi.mock("./db");

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService();
  });

  describe("createUser", () => {
    it("should create user with hashed password", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "secret123" };
      const mockUser = { id: "1", ...input, password: "hashed" };
      vi.mocked(db.user.create).mockResolvedValue(mockUser);

      // Act
      const result = await service.createUser(input);

      // Assert
      expect(result.password).not.toBe("secret123");
      expect(db.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "test@example.com",
          password: expect.stringMatching(/^\$2b\$/),
        }),
      });
    });
  });
});
```

### Testing Patterns by Type

#### Pure Functions

```typescript
// utils/validation.test.ts
describe("validateEmail", () => {
  it.each([
    ["valid@email.com", true],
    ["invalid-email", false],
    ["", false],
    ["user@", false],
    ["@domain.com", false],
  ])("validateEmail(%s) returns %s", (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

#### Async Functions

```typescript
// api/fetchUser.test.ts
describe("fetchUser", () => {
  it("should handle network errors gracefully", async () => {
    // Mock fetch to simulate network error
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchUser("123");

    expect(result).toEqual({
      error: "Failed to fetch user",
      data: null,
    });
  });
});
```

#### React Components

```tsx
// components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";

describe("Button", () => {
  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Integration Testing Patterns

### Database Integration Tests

```typescript
// tests/integration/user.repository.test.ts
import { beforeAll, afterAll, beforeEach } from "vitest";
import { UserRepository } from "@/repositories/user";
import { testDb } from "@/tests/helpers/test-db";

describe("UserRepository Integration", () => {
  let repo: UserRepository;

  beforeAll(async () => {
    await testDb.migrate();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clear();
    repo = new UserRepository(testDb);
  });

  it("should create and retrieve user", async () => {
    // Create user
    const created = await repo.create({
      email: "test@example.com",
      name: "Test User",
    });

    // Retrieve user
    const retrieved = await repo.findById(created.id);

    expect(retrieved).toMatchObject({
      email: "test@example.com",
      name: "Test User",
    });
  });
});
```

### API Integration Tests

```typescript
// tests/integration/api/users.test.ts
import { createTestApp } from "@/tests/helpers/test-app";
import supertest from "supertest";

describe("Users API", () => {
  const app = createTestApp();
  const request = supertest(app);

  describe("POST /api/users", () => {
    it("should create user with valid data", async () => {
      const response = await request
        .post("/api/users")
        .send({
          email: "new@example.com",
          password: "secure123",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: "new@example.com",
      });
      expect(response.body.password).toBeUndefined();
    });

    it("should reject invalid email", async () => {
      const response = await request
        .post("/api/users")
        .send({
          email: "invalid-email",
          password: "secure123",
        })
        .expect(400);

      expect(response.body.error).toContain("email");
    });
  });
});
```

## E2E Testing Patterns

### Playwright Setup

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should login with valid credentials", async ({ page }) => {
    // Navigate to login
    await page.click("text=Login");

    // Fill form
    await page.fill("[name=email]", "user@example.com");
    await page.fill("[name=password]", "password123");

    // Submit
    await page.click("button[type=submit]");

    // Verify redirect and user info
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });
});
```

### E2E Best Practices

```typescript
// tests/e2e/helpers/auth.ts
export async function loginAs(page: Page, role: "user" | "admin") {
  const credentials = {
    user: { email: "user@test.com", password: "userpass" },
    admin: { email: "admin@test.com", password: "adminpass" },
  };

  await page.goto("/login");
  await page.fill("[name=email]", credentials[role].email);
  await page.fill("[name=password]", credentials[role].password);
  await page.click("button[type=submit]");
  await page.waitForURL("/dashboard");
}

// Usage in tests
test("admin should see admin panel", async ({ page }) => {
  await loginAs(page, "admin");
  await expect(page.locator("[data-testid=admin-panel]")).toBeVisible();
});
```

## Test Data Management

### Fixtures for Consistent Test Data

```typescript
// tests/fixtures/users.ts
export const fixtures = {
  users: {
    alice: {
      id: "1",
      email: "alice@example.com",
      name: "Alice Smith",
      role: "user",
    },
    bob: {
      id: "2",
      email: "bob@example.com",
      name: "Bob Jones",
      role: "admin",
    },
  },
};

// tests/fixtures/factories.ts
import { faker } from "@faker-js/faker";

export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.recent(),
    ...overrides,
  };
}

export function createPost(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    authorId: faker.string.uuid(),
    ...overrides,
  };
}
```

### Database Seeding

```typescript
// tests/helpers/seed.ts
import { db } from "@/lib/db";
import { fixtures } from "../fixtures";

export async function seedDatabase() {
  // Clear existing data
  await db.post.deleteMany();
  await db.user.deleteMany();

  // Insert test users
  await db.user.createMany({
    data: Object.values(fixtures.users),
  });

  // Insert test posts
  await db.post.createMany({
    data: [
      {
        title: "First Post",
        content: "Content here",
        authorId: fixtures.users.alice.id,
      },
    ],
  });
}

// Usage in tests
beforeEach(async () => {
  await seedDatabase();
});
```

## Mocking Strategies

### Mock External Services

```typescript
// tests/mocks/email.ts
import { vi } from "vitest";

export const mockEmailService = {
  sendEmail: vi.fn().mockResolvedValue({ sent: true }),
  sendBulkEmail: vi.fn().mockResolvedValue({ sent: 10, failed: 0 }),
};

// In test setup
vi.mock("@/services/email", () => ({
  emailService: mockEmailService,
}));
```

### Mock Time and Dates

```typescript
// tests/helpers/time.ts
import { vi } from "vitest";

export function mockDate(date: string | Date) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));
}

export function restoreDate() {
  vi.useRealTimers();
}

// Usage
describe("Subscription", () => {
  it("should expire after 30 days", () => {
    mockDate("2024-01-01");
    const subscription = createSubscription();

    mockDate("2024-01-31");
    expect(subscription.isExpired()).toBe(true);

    restoreDate();
  });
});
```

## AI-Assisted Test Generation

### Prompt Templates

#### Unit Test Generation

````markdown
Generate unit tests for this function:

```typescript
[paste function code]
```
````

Requirements:

- Use Vitest as testing framework
- Cover happy path and edge cases
- Include error scenarios
- Mock external dependencies
- Use descriptive test names
- Add arrange-act-assert comments

````

#### Integration Test Generation
```markdown
Generate integration tests for this API endpoint:
```typescript
[paste endpoint code]
````

Requirements:

- Test all HTTP methods
- Include validation testing
- Test error responses
- Use supertest for requests
- Mock database if needed
- Test authentication/authorization

````

#### E2E Test Generation
```markdown
Generate Playwright E2E test for this user flow:
1. User visits homepage
2. Clicks "Sign Up"
3. Fills registration form
4. Submits form
5. Verifies email
6. Logs in
7. Sees dashboard

Include:
- Page object pattern
- Error scenario testing
- Mobile viewport testing
- Accessibility checks
````

## Coverage Goals and Measurement

### Setting Coverage Goals

```json
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
}
```

### What to Test vs What Not to Test

**DO Test:**

- Business logic
- Data transformations
- API contracts
- Error handling
- Edge cases
- Security boundaries

**DON'T Test:**

- Third-party libraries
- Language features
- Simple getters/setters
- Framework internals
- Generated code

## Testing Checklist

Before committing code:

- [ ] Unit tests pass locally
- [ ] Integration tests pass
- [ ] Coverage meets thresholds
- [ ] No `.only` or `.skip` left in tests
- [ ] Test names are descriptive
- [ ] No hardcoded test data
- [ ] Mocks are properly cleaned up
- [ ] Tests run in < 30 seconds

## Common Testing Pitfalls

1. **Testing Implementation, Not Behavior**

   ```typescript
   // ❌ Bad - tests internal implementation
   expect(service._calculateTax).toHaveBeenCalled();

   // ✅ Good - tests behavior
   expect(result.tax).toBe(10);
   ```

2. **Shared State Between Tests**

   ```typescript
   // ❌ Bad - modifies shared object
   const user = { name: "John" };
   it("test 1", () => {
     user.name = "Jane";
   });
   it("test 2", () => {
     /* user.name is 'Jane'! */
   });

   // ✅ Good - creates fresh object
   let user;
   beforeEach(() => {
     user = { name: "John" };
   });
   ```

3. **Testing Too Much in One Test**

   ```typescript
   // ❌ Bad - multiple assertions for different behaviors
   it("should handle user operations", () => {
     // Tests create, update, delete all in one
   });

   // ✅ Good - focused tests
   it("should create user");
   it("should update user");
   it("should delete user");
   ```

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- Project-specific patterns: `examples/testing/`
- Test utilities: `tests/helpers/`
