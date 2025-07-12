# End-to-End Testing Guide

## Table of Contents

1. [E2E Testing Prompt Template](#e2e-testing-prompt-template)
2. [User Workflow:](#user-workflow)
3. [Technical Context:](#technical-context)
4. [Test Environment:](#test-environment)
5. [Specific Requirements:](#specific-requirements)
6. [E2E Testing Strategies](#e2e-testing-strategies)
  7. [1. User Journey Testing](#1-user-journey-testing)
    8. [Complete Registration Flow](#complete-registration-flow)
    9. [E-commerce Purchase Flow](#e-commerce-purchase-flow)
  10. [2. Cross-Browser Testing](#2-cross-browser-testing)
    11. [Multi-Browser Test Configuration](#multi-browser-test-configuration)
  12. [3. Mobile Testing](#3-mobile-testing)
    13. [Mobile-Specific E2E Tests](#mobile-specific-e2e-tests)
  14. [4. Performance Testing](#4-performance-testing)
    15. [Core Web Vitals Testing](#core-web-vitals-testing)
  16. [5. Accessibility Testing](#5-accessibility-testing)
    17. [A11y E2E Testing](#a11y-e2e-testing)
18. [E2E Testing Optimal Practices](#e2e-testing-optimal-practices)
  19. [1. Test Structure and Organization](#1-test-structure-and-organization)
    20. [Page Object Model](#page-object-model)
    21. [Test Data Management](#test-data-management)
  22. [2. Error Handling and Debugging](#2-error-handling-and-debugging)
    23. [Comprehensive Error Handling](#comprehensive-error-handling)
24. [E2E Testing Checklist](#e2e-testing-checklist)
  25. [Test Planning](#test-planning)
  26. [Test Implementation](#test-implementation)
  27. [Test Maintenance](#test-maintenance)
  28. [Monitoring and Reporting](#monitoring-and-reporting)

## E2E Testing Prompt Template

```text
I need to create end-to-end tests for [USER_WORKFLOW]. Please help me design comprehensive E2E tests:

## User Workflow:
- [ ] User journey: [Describe the complete user flow]
- [ ] Entry points: [How users start the workflow]
- [ ] Success criteria: [What constitutes successful completion]
- [ ] Error scenarios: [What can go wrong]
- [ ] Cross-browser requirements: [Browser compatibility needs]
- [ ] Mobile testing: [Mobile-specific requirements]

## Technical Context:
- Frontend framework: [React, Vue, Angular, etc.]
- Testing framework: [Cypress, Playwright, Selenium]
- Backend APIs: [List relevant endpoints]
- Authentication: [Auth method and flow]
- External services: [Third-party integrations]

## Test Environment:
- Test environment URL: [Staging/test environment]
- Test data strategy: [How to handle test data]
- Database state: [How to manage database state]
- Mock strategy: [What external services to mock]

## Specific Requirements:
- [List specific features to test]
- [Mention performance requirements]
- [Note accessibility requirements]
- [Include any special edge cases]

Please provide E2E test examples with setup, test cases, and optimal practices.
```

## E2E Testing Strategies

### 1. User Journey Testing

#### Complete Registration Flow

```typescript
// Cypress E2E test for user registration
describe("User Registration Flow", () => {
  beforeEach(() => {
    // Setup clean test environment
    cy.task("db:seed");
    cy.visit("/register");
  });

  afterEach(() => {
    // Cleanup
    cy.task("db:clean");
  });

  it("should complete full registration workflow", () => {
    const userEmail = `test-${Date.now()}@example.com`;

    // Step 1: Fill registration form
    cy.get('[data-testid="name-input"]').type("John Doe");
    cy.get('[data-testid="email-input"]').type(userEmail);
    cy.get('[data-testid="password-input"]').type("SecurePassword123!");
    cy.get('[data-testid="confirm-password-input"]').type("SecurePassword123!");

    // Step 2: Accept terms and submit
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="register-button"]').click();

    // Step 3: Verify email verification prompt
    cy.contains("Please check your email").should("be.visible");
    cy.url().should("include", "/verify-email");

    // Step 4: Simulate email verification
    cy.task("getVerificationToken", userEmail).then((token) => {
      cy.visit(`/verify-email?token=${token}`);
    });

    // Step 5: Verify successful verification
    cy.contains("Email verified successfully").should("be.visible");
    cy.get('[data-testid="continue-button"]').click();

    // Step 6: Complete profile setup
    cy.url().should("include", "/profile-setup");
    cy.get('[data-testid="bio-input"]').type(
      "Software developer passionate about testing",
    );
    cy.get('[data-testid="location-input"]').type("San Francisco, CA");
    cy.get('[data-testid="save-profile-button"]').click();

    // Step 7: Verify successful onboarding
    cy.url().should("include", "/dashboard");
    cy.contains("Welcome, John Doe").should("be.visible");

    // Step 8: Verify user data persistence
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="profile-link"]').click();
    cy.get('[data-testid="user-bio"]').should("contain", "Software developer");
  });

  it("should handle registration errors gracefully", () => {
    // Test email already exists
    cy.get('[data-testid="email-input"]').type("existing@example.com");
    cy.get('[data-testid="name-input"]').type("John Doe");
    cy.get('[data-testid="password-input"]').type("SecurePassword123!");
    cy.get('[data-testid="confirm-password-input"]').type("SecurePassword123!");
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="register-button"]').click();

    cy.contains("Email already exists").should("be.visible");
    cy.get('[data-testid="email-input"]').should("have.class", "error");
  });

  it("should validate form fields", () => {
    // Test password mismatch
    cy.get('[data-testid="password-input"]').type("SecurePassword123!");
    cy.get('[data-testid="confirm-password-input"]').type(
      "DifferentPassword123!",
    );
    cy.get('[data-testid="register-button"]').click();

    cy.contains("Passwords do not match").should("be.visible");

    // Test weak password
    cy.get('[data-testid="password-input"]').clear().type("weak");
    cy.get('[data-testid="confirm-password-input"]').clear().type("weak");
    cy.get('[data-testid="register-button"]').click();

    cy.contains("Password must be at least 8 characters").should("be.visible");
  });
});
```

#### E-commerce Purchase Flow

```typescript
// Playwright E2E test for e-commerce purchase
import { test, expect } from "@playwright/test";

test.describe("Product Purchase Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await page.goto("/");

    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "testpassword");
    await page.click('[data-testid="submit-login"]');

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("should complete product purchase successfully", async ({ page }) => {
    // Step 1: Browse products
    await page.click('[data-testid="products-link"]');
    await page.waitForSelector('[data-testid="product-grid"]');

    // Step 2: View product details
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();

    // Step 3: Add to cart
    await page.selectOption('[data-testid="size-select"]', "M");
    await page.selectOption('[data-testid="color-select"]', "Blue");
    await page.click('[data-testid="quantity-increase"]'); // Quantity: 2
    await page.click('[data-testid="add-to-cart-button"]');

    // Verify cart update
    await expect(page.locator('[data-testid="cart-count"]')).toContainText("2");

    // Step 4: View cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    const cartTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    expect(cartTotal).toMatch(/\$\d+\.\d{2}/);

    // Step 5: Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await page.waitForURL("**/checkout");

    // Step 6: Fill shipping information
    await page.fill('[data-testid="shipping-name"]', "John Doe");
    await page.fill('[data-testid="shipping-address"]', "123 Main St");
    await page.fill('[data-testid="shipping-city"]', "San Francisco");
    await page.selectOption('[data-testid="shipping-state"]', "CA");
    await page.fill('[data-testid="shipping-zip"]', "94102");

    // Step 7: Select shipping method
    await page.check('[data-testid="shipping-standard"]');

    // Step 8: Fill payment information
    await page.fill('[data-testid="card-number"]', "4242424242424242");
    await page.fill('[data-testid="card-expiry"]', "12/25");
    await page.fill('[data-testid="card-cvc"]', "123");
    await page.fill('[data-testid="card-name"]', "John Doe");

    // Step 9: Review and place order
    await page.click('[data-testid="review-order-button"]');

    // Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    const orderTotal = await page
      .locator('[data-testid="order-total"]')
      .textContent();
    expect(orderTotal).toMatch(/\$\d+\.\d{2}/);

    // Place order
    await page.click('[data-testid="place-order-button"]');

    // Step 10: Verify order confirmation
    await page.waitForURL("**/order-confirmation");
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();

    const orderNumber = await page
      .locator('[data-testid="order-number"]')
      .textContent();
    expect(orderNumber).toMatch(/ORD-\d+/);

    // Step 11: Verify order in account
    await page.click('[data-testid="view-orders-link"]');
    await expect(
      page.locator(`[data-testid="order-${orderNumber}"]`),
    ).toBeVisible();
  });

  test("should handle payment failures", async ({ page }) => {
    // Add product to cart
    await page.goto("/products/test-product");
    await page.click('[data-testid="add-to-cart-button"]');
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');

    // Fill shipping info
    await page.fill('[data-testid="shipping-name"]', "John Doe");
    await page.fill('[data-testid="shipping-address"]', "123 Main St");
    await page.fill('[data-testid="shipping-city"]', "San Francisco");
    await page.selectOption('[data-testid="shipping-state"]', "CA");
    await page.fill('[data-testid="shipping-zip"]', "94102");

    // Use declined card number
    await page.fill('[data-testid="card-number"]', "4000000000000002");
    await page.fill('[data-testid="card-expiry"]', "12/25");
    await page.fill('[data-testid="card-cvc"]', "123");
    await page.fill('[data-testid="card-name"]', "John Doe");

    await page.click('[data-testid="review-order-button"]');
    await page.click('[data-testid="place-order-button"]');

    // Verify error handling
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      "declined",
    );

    // Verify user can retry
    await expect(
      page.locator('[data-testid="retry-payment-button"]'),
    ).toBeVisible();
  });
});
```

### 2. Cross-Browser Testing

#### Multi-Browser Test Configuration

```typescript
// Playwright config for cross-browser testing
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});

// Cross-browser compatible test
test.describe("Cross-Browser Compatibility", () => {
  test("should work across all browsers", async ({ page, browserName }) => {
    await page.goto("/");

    // Test critical functionality
    await page.click('[data-testid="main-cta"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();

    // Browser-specific assertions if needed
    if (browserName === "webkit") {
      // Safari-specific checks
      await expect(page.locator(".safari-specific")).toBeVisible();
    }
  });
});
```

### 3. Mobile Testing

#### Mobile-Specific E2E Tests

```typescript
// Mobile-specific test scenarios
test.describe("Mobile User Experience", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("should handle mobile navigation", async ({ page }) => {
    await page.goto("/");

    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test navigation
    await page.click('[data-testid="mobile-nav-products"]');
    await page.waitForURL("**/products");

    // Test swipe gestures (if applicable)
    const productCarousel = page.locator('[data-testid="product-carousel"]');
    await productCarousel.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();

    // Verify carousel moved
    await expect(page.locator('[data-testid="carousel-item-2"]')).toBeVisible();
  });

  test("should handle touch interactions", async ({ page }) => {
    await page.goto("/products");

    // Test touch scroll
    await page.touchscreen.tap(200, 300);

    // Test pull-to-refresh (if implemented)
    await page.touchscreen.tap(200, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    // Verify refresh indicator
    await expect(
      page.locator('[data-testid="refresh-indicator"]'),
    ).toBeVisible();
  });

  test("should adapt to different screen sizes", async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone 5
      { width: 375, height: 812 }, // iPhone X
      { width: 768, height: 1024 }, // iPad
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      // Verify responsive layout
      const header = page.locator('[data-testid="header"]');
      const headerHeight = await header.boundingBox();

      expect(headerHeight?.height).toBeLessThan(viewport.height * 0.3);

      // Verify content is accessible
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    }
  });
});
```

### 4. Performance Testing

#### Core Web Vitals Testing

```typescript
// Performance-focused E2E tests
test.describe("Performance Testing", () => {
  test("should meet Core Web Vitals thresholds", async ({ page }) => {
    // Navigate to page
    await page.goto("/");

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};

          entries.forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === "first-input") {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === "layout-shift") {
              metrics.cls = (metrics.cls || 0) + entry.value;
            }
          });

          resolve(metrics);
        }).observe({
          entryTypes: [
            "largest-contentful-paint",
            "first-input",
            "layout-shift",
          ],
        });

        // Timeout after 10 seconds
        setTimeout(() => resolve({}), 10000);
      });
    });

    // Assert Core Web Vitals thresholds
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    }
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100); // FID < 100ms
    }
    if (metrics.cls) {
      expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test("should load pages within performance budget", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/products");
    await page.waitForSelector('[data-testid="product-grid"]');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Page loads in < 3 seconds

    // Check bundle size
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes(".js"))
        .reduce((total, entry) => total + entry.transferSize, 0);
    });

    expect(resources).toBeLessThan(500 * 1024); // JS bundle < 500KB
  });
});
```

### 5. Accessibility Testing

#### A11y E2E Testing

```typescript
// Accessibility testing with axe-core
import { injectAxe, checkA11y, getViolations } from "axe-playwright";

test.describe("Accessibility Testing", () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test("should be accessible on all pages", async ({ page }) => {
    const pages = ["/", "/products", "/about", "/contact"];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation
    await page.keyboard.press("Tab");
    let focusedElement = await page
      .locator(":focus")
      .getAttribute("data-testid");
    expect(focusedElement).toBe("skip-link");

    await page.keyboard.press("Tab");
    focusedElement = await page.locator(":focus").getAttribute("data-testid");
    expect(focusedElement).toBe("main-nav");

    // Test Enter key activation
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-testid="nav-dropdown"]')).toBeVisible();

    // Test Escape key
    await page.keyboard.press("Escape");
    await expect(
      page.locator('[data-testid="nav-dropdown"]'),
    ).not.toBeVisible();
  });

  test("should work with screen readers", async ({ page }) => {
    await page.goto("/products");

    // Check for proper ARIA labels
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toHaveAttribute("role", "grid");
    await expect(productGrid).toHaveAttribute("aria-label");

    // Check for live regions
    await page.click('[data-testid="filter-button"]');
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText("Filters applied");
  });
});
```

## E2E Testing Optimal Practices

### 1. Test Structure and Organization

#### Page Object Model

```typescript
// Page Object Model implementation
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async getErrorMessage() {
    return this.page.locator('[data-testid="error-message"]').textContent();
  }
}

export class DashboardPage {
  constructor(private page: Page) {}

  async isLoaded() {
    await this.page.waitForSelector('[data-testid="dashboard"]');
  }

  async getUserName() {
    return this.page.locator('[data-testid="user-name"]').textContent();
  }
}

// Usage in tests
test("should login successfully", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login("test@example.com", "password");
  await dashboardPage.isLoaded();

  const userName = await dashboardPage.getUserName();
  expect(userName).toBe("Test User");
});
```

#### Test Data Management

```typescript
// Test data utilities
export class TestDataManager {
  static async createTestUser(overrides = {}) {
    const userData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: "TestPassword123!",
      ...overrides,
    };

    const response = await request.post("/api/test/users", {
      data: userData,
    });

    return response.json();
  }

  static async cleanupTestUser(userId: string) {
    await request.delete(`/api/test/users/${userId}`);
  }

  static async createTestProduct(overrides = {}) {
    const productData = {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      ...overrides,
    };

    const response = await request.post("/api/test/products", {
      data: productData,
    });

    return response.json();
  }
}

// Usage in tests
test("should purchase product", async ({ page }) => {
  // Setup test data
  const testUser = await TestDataManager.createTestUser();
  const testProduct = await TestDataManager.createTestProduct({
    price: 99.99,
    stock: 10,
  });

  try {
    // Run test with known data
    await page.goto("/login");
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await page.goto(`/products/${testProduct.id}`);
    await page.click('[data-testid="add-to-cart"]');

    // Continue with test...
  } finally {
    // Cleanup
    await TestDataManager.cleanupTestUser(testUser.id);
  }
});
```

### 2. Error Handling and Debugging

#### Comprehensive Error Handling

```typescript
// E2E test with robust error handling
test("should handle network failures gracefully", async ({ page }) => {
  // Setup network interception
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Internal Server Error" }),
    });
  });

  await page.goto("/users");

  // Verify error state
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

  // Test retry functionality
  await page.unroute("**/api/users");
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ users: [] }),
    });
  });

  await page.click('[data-testid="retry-button"]');
  await expect(page.locator('[data-testid="users-list"]')).toBeVisible();
});

// Debug helpers
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Capture additional debug info on failure
    const screenshot = await page.screenshot({
      path: `test-results/failure-${testInfo.title}.png`,
    });
    await testInfo.attach("screenshot", {
      body: screenshot,
      contentType: "image/png",
    });

    const html = await page.content();
    await testInfo.attach("page-html", {
      body: html,
      contentType: "text/html",
    });

    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    await testInfo.attach("console-logs", {
      body: JSON.stringify(logs),
      contentType: "application/json",
    });
  }
});
```

## E2E Testing Checklist

### Test Planning

- [ ] **User Journeys**: Critical user flows identified
- [ ] **Browser Support**: Target browsers defined
- [ ] **Device Coverage**: Mobile/tablet scenarios included
- [ ] **Performance Goals**: Performance budgets set
- [ ] **Accessibility Requirements**: A11y standards defined

### Test Implementation

- [ ] **Page Objects**: Reusable page objects created
- [ ] **Test Data**: Reliable test data strategy
- [ ] **Error Scenarios**: Failure cases covered
- [ ] **Network Conditions**: Slow/offline scenarios tested
- [ ] **Authentication**: Login/logout flows tested

### Test Maintenance

- [ ] **CI Integration**: Tests run in CI/CD pipeline
- [ ] **Parallel Execution**: Tests run efficiently in parallel
- [ ] **Flaky Test Handling**: Retry mechanisms implemented
- [ ] **Debug Information**: Failure debugging enabled
- [ ] **Regular Updates**: Tests updated with new features

### Monitoring and Reporting

- [ ] **Test Results**: Clear reporting and notifications
- [ ] **Performance Tracking**: Performance metrics tracked
- [ ] **Coverage Analysis**: Test coverage measured
- [ ] **Failure Analysis**: Root cause analysis process
- [ ] **Continuous Improvement**: Regular test review and optimization
