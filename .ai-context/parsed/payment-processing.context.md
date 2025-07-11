# AI Context: payment-processing

Generated: 2025-07-11T05:06:31.967Z

## Code Sections

### examples/test-annotations.js (lines 3-71)

```js
// @ai-context: payment-processing
// This module handles all payment processing logic

const stripe = require("stripe");

// @ai-previous: docs/decisions/payment-provider.md
// We chose Stripe based on the analysis in the decision document

// @ai-pattern: repository-pattern
class PaymentRepository {
  constructor(db) {
    this.db = db;
  }

  // @ai-important
  // This method must validate the payment method before processing
  async processPayment(paymentData) {
    // Validate first
    if (!this.validatePaymentMethod(paymentData)) {
      throw new Error("Invalid payment method");
    }

    // Process payment
    return await stripe.charges.create(paymentData);
  }

  // @ai-ignore
  // Legacy method - do not modify
  oldPaymentHandler(data) {
    // Old implementation
    console.log("Processing payment the old way");
  }
  // @ai-ignore-end

  validatePaymentMethod(data) {
    // @ai-pattern: validation-pattern
    return data.amount > 0 && data.currency && data.method;
  }
}

// @ai-context: order-processing
// Order processing that uses the payment system

class OrderService {
  constructor(paymentRepo) {
    // @ai-previous: architecture-decisions/service-pattern.md
    this.paymentRepo = paymentRepo;
  }

  async createOrder(orderData) {
    // @ai-important
    // Orders must be saved before payment processing
    const order = await this.saveOrder(orderData);

    try {
      const payment = await this.paymentRepo.processPayment(orderData.payment);
      order.paymentId = payment.id;
      await this.updateOrder(order);
    } catch (error) {
      // @ai-pattern: error-handling
      await this.markOrderFailed(order, error);
      throw error;
    }

    return order;
  }
}

module.exports = { PaymentRepository, OrderService };
```

### docs/guides/ai-development/ai-context-management.md (lines 141-317)

```md
// @ai-context: payment-processing
// This entire section handles payment processing logic

// @ai-previous: docs/decisions/payment-provider.md
// We chose Stripe based on the decision documented above

// @ai-pattern: repository-pattern
class PaymentRepository {
// Implementation following repository pattern
}

// @ai-important
// Critical: This must run before processing payments
validatePaymentMethod();

// @ai-ignore
// Legacy code - AI should not suggest changes here
function oldPaymentHandler() {
// ...
}
// @ai-ignore-end
```

#### Parse and Generate Context Files

```bash
npm run ai:parse
```

This will:

- Scan all source files for annotations
- Generate context files in `.ai-context/parsed/`
- Create VS Code snippets for annotations
- Produce a summary report

#### Using Generated Contexts

After parsing, focus on discovered contexts:

```bash
# See what contexts were found
npm run ai:focus --list

# Focus on payment processing context
npm run ai:focus payment-processing
```

## 📋 Complete Workflow Example

Here's how to use all three tools together:

### 1. Starting a New Feature

```bash
# Create feature branch
git checkout -b feature/user-notifications

# Auto-focus AI context
npm run ai:focus --auto
```

### 2. Add Context Annotations While Coding

```typescript
// @ai-context: user-notifications
// @ai-previous: docs/decisions/notification-architecture.md

// @ai-pattern: observer-pattern
export class NotificationService {
  // @ai-important
  // Must handle both email and push notifications
  async send(notification: Notification) {
    // Implementation
  }
}
```

### 3. Document Patterns for AI and Humans

Create `docs/unified/notification-patterns.md`:

````markdown
---meta: title = Notification Patterns---

---

human---

# Notification System

How we handle user notifications...

---ai-rule---
Always use the NotificationService for sending notifications

---ai-pattern---

### Notification Interface

```typescript
interface Notification {
  type: "email" | "push" | "sms";
  recipient: string;
  content: NotificationContent;
}
```
````

````

### 4. Compile and Parse

```bash
# Compile documentation
npm run docs:compile

# Parse code annotations
npm run ai:parse

# Update focus with new context
npm run ai:focus user-notifications
````

## 🚀 Best Practices

### 1. Branch-Based Context Switching

```bash
# In your git hooks or shell config
alias gco='git checkout $1 && npm run ai:focus --auto'
```

### 2. Regular Context Updates

```bash
# Weekly or after major changes
npm run ai:parse
npm run docs:compile
```

### 3. Context Naming Conventions

- Use kebab-case: `payment-integration`, `user-auth`
- Match feature branch names when possible
- Be specific but not too granular

### 4. Annotation Guidelines

- Add `@ai-context` at the start of major features
- Use `@ai-previous` to reference decisions
- Mark critical sections with `@ai-important`
- Hide legacy code with `@ai-ignore` blocks

## 🔍 Troubleshooting

### AI Still Seeing Too Many Files

1. Check current focus: `npm run ai:focus --show`
2. Review `.aiignore` contents
3. Run with more specific context name
4. Check relevance scoring in `.ai-context/[feature].context`

### Context Not Found

1. Ensure annotations are in supported file types
2. Check for typos in context names
3. Run `npm run ai:parse` to update
4. Look in `.ai-context/summary.md` for discovered contexts

### Documentation Not Compiling

1. Check syntax in `docs/unified/` files
2. Ensure section markers are on their own lines
3. Look for unclosed code blocks
4. Check console output for specific errors

## 📚 Next Steps

1. Start with `npm run ai:focus --auto` on your current branch
2. Add a few `@ai-context` annotations to your code
3. Create one unified doc for your main patterns
4. Gradually expand usage as you see benefits

These tools fundamentally change how AI assistants understand your codebase, making them exponentially more effective as your project grows.

```

## Related Patterns

### Pattern: repository-pattern

Used in examples/test-annotations.js:11

```

class PaymentRepository {
constructor(db) {
this.db = db;
}

// @ai-important
// This method must validate the payment method before processing
async processPayment(paymentData) {
// Validate first
if (!this.validatePaymentMethod(paymentData)) {
throw new Error('Invalid payment method');
}

    // Process payment
    return await stripe.charges.create(paymentData);

}

// @ai-ignore
// Legacy method - do not modify

```

Used in docs/guides/ai-development/ai-context-management.md:147

```

class PaymentRepository {
// Implementation following repository pattern
}

// @ai-important
// Critical: This must run before processing payments
validatePaymentMethod();

// @ai-ignore
// Legacy code - AI should not suggest changes here
function oldPaymentHandler() {
// ...
}
// @ai-ignore-end

````

#### Parse and Generate Context Files

```bash
````

## References

- docs/decisions/payment-provider.md (referenced in examples/test-annotations.js:8)
- docs/decisions/payment-provider.md (referenced in docs/guides/ai-development/ai-context-management.md:144)
