/**
 * Maintenance Anti-Patterns - Hard to Maintain Code
 *
 * This file demonstrates code patterns that make maintenance difficult
 * and how to write more maintainable alternatives.
 */

// ❌ ANTI-PATTERN 1: Poor naming and unclear intent
export const POOR_NAMING = {
  // DON'T DO THIS - Unclear, abbreviated names
  badFunction: (u: any[], f: string, s: boolean) => {
    const r = [];
    for (let i = 0; i < u.length; i++) {
      if (s) {
        if (u[i].n.includes(f)) {
          r.push(u[i]);
        }
      } else {
        if (u[i].n === f) {
          r.push(u[i]);
        }
      }
    }
    return r;
  },

  // DON'T DO THIS - Misleading names
  calculateTotal: (items: any[]) => {
    return items.length; // Actually returns count, not total!
  },

  // DON'T DO THIS - Magic numbers and unclear logic
  processData: (data: any) => {
    if (data.status === 1) {
      // What does 1 mean?
      return data.value * 1.08; // What is 1.08?
    } else if (data.status === 2) {
      return data.value * 0.95;
    }
    return data.value;
  },

  // DON'T DO THIS - Unclear variable names
  badVariableNames: () => {
    const d = new Date();
    const temp = getData();
    const flag = true;
    const data = processTemp(temp);
    const result = flag ? data : temp;
    return result;
  },
};

// ✅ BETTER APPROACH: Clear, descriptive naming
export const CLEAR_NAMING = {
  // Clear function name and parameters
  filterUsersByName: (
    users: User[],
    filterText: string,
    isPartialMatch: boolean,
  ): User[] => {
    const filteredUsers = [];

    for (const user of users) {
      const nameMatches = isPartialMatch
        ? user.name.includes(filterText)
        : user.name === filterText;

      if (nameMatches) {
        filteredUsers.push(user);
      }
    }

    return filteredUsers;
  },

  // Function name clearly indicates what it returns
  calculateItemCount: (items: any[]): number => {
    return items.length;
  },

  // Named constants and clear logic
  applyStatusBasedMultiplier: (data: any): number => {
    const STATUS = {
      ACTIVE: 1,
      INACTIVE: 2,
    } as const;

    const MULTIPLIER = {
      ACTIVE_TAX_RATE: 1.08,
      INACTIVE_DISCOUNT_RATE: 0.95,
    } as const;

    switch (data.status) {
      case STATUS.ACTIVE:
        return data.value * MULTIPLIER.ACTIVE_TAX_RATE;
      case STATUS.INACTIVE:
        return data.value * MULTIPLIER.INACTIVE_DISCOUNT_RATE;
      default:
        return data.value;
    }
  },

  // Clear, descriptive variable names
  processUserRegistration: () => {
    const currentTimestamp = new Date();
    const rawUserData = getUserRegistrationData();
    const shouldSendWelcomeEmail = true;
    const validatedUserData = validateUserData(rawUserData);

    const registrationResult = shouldSendWelcomeEmail
      ? processWithWelcomeEmail(validatedUserData)
      : processWithoutWelcomeEmail(rawUserData);

    return registrationResult;
  },
};

// ❌ ANTI-PATTERN 2: Massive, monolithic functions
export const MONOLITHIC_FUNCTIONS = {
  // DON'T DO THIS - 100+ line function doing everything
  processUserOrder: async (orderData: any) => {
    // Validation (20 lines)
    if (!orderData) throw new Error("Order data required");
    if (!orderData.items || orderData.items.length === 0)
      throw new Error("Items required");
    if (!orderData.customerId) throw new Error("Customer ID required");
    if (!orderData.paymentMethod) throw new Error("Payment method required");

    // Customer validation (15 lines)
    const customer = await db.findCustomer(orderData.customerId);
    if (!customer) throw new Error("Customer not found");
    if (customer.status === "banned") throw new Error("Customer banned");
    if (customer.paymentMethods.length === 0)
      throw new Error("No payment methods");

    // Inventory check (20 lines)
    for (const item of orderData.items) {
      const product = await db.findProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error("Insufficient stock");
      if (!product.active) throw new Error("Product not available");
    }

    // Price calculation (25 lines)
    let subtotal = 0;
    for (const item of orderData.items) {
      const product = await db.findProduct(item.productId);
      subtotal += product.price * item.quantity;
    }

    let discount = 0;
    if (customer.membershipLevel === "premium") {
      discount = subtotal * 0.1;
    } else if (customer.membershipLevel === "gold") {
      discount = subtotal * 0.05;
    }

    const tax = (subtotal - discount) * 0.08;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal - discount + tax + shipping;

    // Payment processing (20 lines)
    const paymentResult = await paymentProcessor.charge({
      amount: total,
      customerId: customer.id,
      paymentMethodId: orderData.paymentMethod,
    });

    if (!paymentResult.success) {
      throw new Error("Payment failed");
    }

    // Inventory update (15 lines)
    for (const item of orderData.items) {
      await db.updateProductStock(item.productId, -item.quantity);
    }

    // Order creation (10 lines)
    const order = await db.createOrder({
      customerId: customer.id,
      items: orderData.items,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      paymentId: paymentResult.id,
    });

    // Notification (10 lines)
    await emailService.sendOrderConfirmation(customer.email, order);
    await smsService.sendOrderUpdate(customer.phone, order.id);

    return order;
  },
};

// ✅ BETTER APPROACH: Decomposed, single-responsibility functions
export const DECOMPOSED_FUNCTIONS = {
  processUserOrder: async (orderData: any) => {
    await validateOrderData(orderData);
    const customer = await validateCustomer(orderData.customerId);
    await validateInventory(orderData.items);

    const pricing = calculateOrderPricing(orderData.items, customer);
    const payment = await processPayment(
      pricing.total,
      customer,
      orderData.paymentMethod,
    );

    await updateInventory(orderData.items);
    const order = await createOrder(orderData, customer, pricing, payment);

    await sendOrderNotifications(customer, order);

    return order;
  },
};

// ❌ ANTI-PATTERN 3: Deep nesting and complex conditions
export const DEEP_NESTING = {
  // DON'T DO THIS - Deep nesting makes code hard to follow
  processUserAccess: (user: any, resource: any, action: string) => {
    if (user) {
      if (user.active) {
        if (user.permissions) {
          if (user.permissions.length > 0) {
            for (const permission of user.permissions) {
              if (permission.resource === resource.id) {
                if (permission.actions) {
                  if (permission.actions.includes(action)) {
                    if (resource.active) {
                      if (resource.accessLevel <= user.accessLevel) {
                        if (!resource.restricted || user.role === "admin") {
                          return true;
                        } else {
                          return false;
                        }
                      } else {
                        return false;
                      }
                    } else {
                      return false;
                    }
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              }
            }
            return false;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  },

  // DON'T DO THIS - Complex nested conditions
  calculateShippingCost: (order: any) => {
    if (order.items && order.items.length > 0) {
      if (order.customer && order.customer.address) {
        if (order.customer.membershipLevel) {
          if (order.customer.membershipLevel === "premium") {
            if (order.total > 50) {
              return 0;
            } else {
              if (order.customer.address.country === "US") {
                return 5.99;
              } else {
                return 15.99;
              }
            }
          } else if (order.customer.membershipLevel === "standard") {
            if (order.total > 100) {
              return 0;
            } else {
              if (order.customer.address.country === "US") {
                return 8.99;
              } else {
                return 19.99;
              }
            }
          } else {
            if (order.customer.address.country === "US") {
              return 12.99;
            } else {
              return 25.99;
            }
          }
        } else {
          return 12.99;
        }
      } else {
        throw new Error("Address required");
      }
    } else {
      throw new Error("Items required");
    }
  },
};

// ✅ BETTER APPROACH: Early returns and clear logic
export const CLEAR_LOGIC = {
  processUserAccess: (user: any, resource: any, action: string): boolean => {
    // Early returns for invalid cases
    if (!user || !user.active) return false;
    if (!user.permissions || user.permissions.length === 0) return false;
    if (!resource.active) return false;
    if (resource.accessLevel > user.accessLevel) return false;
    if (resource.restricted && user.role !== "admin") return false;

    // Check permissions
    const permission = user.permissions.find((p) => p.resource === resource.id);
    if (!permission || !permission.actions) return false;

    return permission.actions.includes(action);
  },

  calculateShippingCost: (order: any): number => {
    // Validate required data
    if (!order.items || order.items.length === 0) {
      throw new Error("Items required");
    }

    if (!order.customer?.address) {
      throw new Error("Address required");
    }

    const { customer, total } = order;
    const isUS = customer.address.country === "US";
    const membershipLevel = customer.membershipLevel || "basic";

    // Define shipping rules
    const shippingRules = {
      premium: {
        freeThreshold: 50,
        domesticRate: 5.99,
        internationalRate: 15.99,
      },
      standard: {
        freeThreshold: 100,
        domesticRate: 8.99,
        internationalRate: 19.99,
      },
      basic: {
        freeThreshold: Infinity,
        domesticRate: 12.99,
        internationalRate: 25.99,
      },
    };

    const rule = shippingRules[membershipLevel] || shippingRules.basic;

    if (total > rule.freeThreshold) {
      return 0;
    }

    return isUS ? rule.domesticRate : rule.internationalRate;
  },
};

// ❌ ANTI-PATTERN 4: No error handling or poor error handling
export const POOR_ERROR_HANDLING = {
  // DON'T DO THIS - Silent failures
  badAsyncFunction: async (id: string) => {
    try {
      const data = await api.getData(id);
      return data;
    } catch {
      return null; // Silent failure - no way to know what went wrong
    }
  },

  // DON'T DO THIS - Generic error handling
  badErrorCatch: async (userInput: any) => {
    try {
      const result = await processUserInput(userInput);
      return result;
    } catch (error) {
      throw new Error("Something went wrong"); // Loses original error context
    }
  },

  // DON'T DO THIS - No error boundaries
  badErrorPropagation: (data: any) => {
    const result = JSON.parse(data); // Can throw, but not handled
    return result.value.nested.property; // Can throw, but not handled
  },
};

// ✅ BETTER APPROACH: Proper error handling
export const PROPER_ERROR_HANDLING = {
  goodAsyncFunction: async (id: string) => {
    try {
      const data = await api.getData(id);
      return { success: true, data };
    } catch (error) {
      console.error(`Failed to get data for ID ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  goodErrorCatch: async (userInput: any) => {
    try {
      const result = await processUserInput(userInput);
      return result;
    } catch (error) {
      // Preserve original error while adding context
      const enhancedError = new Error(
        `Failed to process user input: ${error.message}`,
      );
      enhancedError.cause = error;
      throw enhancedError;
    }
  },

  goodErrorPropagation: (data: any) => {
    try {
      const parsedData = JSON.parse(data);

      if (!parsedData.value?.nested?.property) {
        throw new Error("Missing required nested property");
      }

      return parsedData.value.nested.property;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON data provided");
      }
      throw error; // Re-throw other errors
    }
  },
};

// ❌ ANTI-PATTERN 5: Tight coupling and hard dependencies
export const TIGHT_COUPLING = {
  // DON'T DO THIS - Direct database calls in business logic
  UserService: class {
    async createUser(userData: any) {
      // Tightly coupled to specific database
      const result = await MySQL.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [userData.name, userData.email],
      );

      // Tightly coupled to specific email service
      await SendGrid.sendEmail({
        to: userData.email,
        subject: "Welcome",
        body: "Welcome to our app!",
      });

      return result;
    }
  },

  // DON'T DO THIS - Hardcoded external service URLs
  PaymentService: class {
    async processPayment(amount: number) {
      // Hardcoded URL - can't be changed without code changes
      const response = await fetch("https://api.stripe.com/v1/charges", {
        method: "POST",
        headers: {
          Authorization: "Bearer sk_test_hardcoded_key", // Hardcoded!
        },
        body: JSON.stringify({ amount }),
      });

      return response.json();
    }
  },
};

// ✅ BETTER APPROACH: Loose coupling and dependency injection
export const LOOSE_COUPLING = {
  // Use dependency injection
  UserService: class {
    constructor(
      private db: DatabaseRepository,
      private emailService: EmailService,
      private logger: Logger,
    ) {}

    async createUser(userData: any) {
      try {
        // Use abstracted database interface
        const user = await this.db.users.create({
          name: userData.name,
          email: userData.email,
        });

        // Use abstracted email service
        await this.emailService.sendWelcomeEmail(user.email);

        this.logger.info("User created successfully", { userId: user.id });
        return user;
      } catch (error) {
        this.logger.error("Failed to create user", error);
        throw error;
      }
    }
  },

  // Use configuration and environment variables
  PaymentService: class {
    constructor(
      private config: PaymentConfig,
      private httpClient: HttpClient,
    ) {}

    async processPayment(amount: number) {
      const response = await this.httpClient.post(
        this.config.apiUrl + "/charges",
        {
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      );

      return response.data;
    }
  },
};

// ❌ ANTI-PATTERN 6: No documentation and unclear interfaces
export const NO_DOCUMENTATION = {
  // DON'T DO THIS - No documentation, unclear parameters
  calc: (a: any, b: any, c?: any) => {
    if (c) {
      return a * b * c;
    }
    return a + b;
  },

  // DON'T DO THIS - No type definitions
  processData: (data: any) => {
    return data.map((item: any) => ({
      id: item.id,
      value: item.amount * 1.2,
      status: item.active ? "live" : "inactive",
    }));
  },
};

// ✅ BETTER APPROACH: Well-documented, typed interfaces
export const WELL_DOCUMENTED = {
  /**
   * Calculates the total cost including tax and fees
   *
   * @param baseAmount - The base amount before tax
   * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
   * @param additionalFees - Optional additional fees to include
   * @returns The total amount including tax and fees
   *
   * @example
   * ```typescript
   * const total = calculateTotalCost(100, 0.08); // Returns 108
   * const totalWithFees = calculateTotalCost(100, 0.08, 15); // Returns 123
   * ```
   */
  calculateTotalCost: (
    baseAmount: number,
    taxRate: number,
    additionalFees?: number,
  ): number => {
    const tax = baseAmount * taxRate;
    const fees = additionalFees || 0;
    return baseAmount + tax + fees;
  },

  /**
   * Transforms raw transaction data into display format
   *
   * @param transactions - Array of raw transaction objects
   * @returns Array of formatted transaction display objects
   */
  processTransactionData: (
    transactions: RawTransaction[],
  ): FormattedTransaction[] => {
    return transactions.map((transaction) => ({
      id: transaction.id,
      displayAmount: transaction.amount * 1.2, // Include 20% markup
      status: transaction.active ? "live" : "inactive",
    }));
  },
};

// Type definitions for better documentation
interface RawTransaction {
  id: string;
  amount: number;
  active: boolean;
}

interface FormattedTransaction {
  id: string;
  displayAmount: number;
  status: "live" | "inactive";
}

interface DatabaseRepository {
  users: {
    create(data: any): Promise<any>;
  };
}

interface EmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: any): void;
}

interface PaymentConfig {
  apiUrl: string;
  apiKey: string;
}

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
}

// Mock implementations
const validateOrderData = async (data: any) => {};
const validateCustomer = async (id: string) => ({ id });
const validateInventory = async (items: any[]) => {};
const calculateOrderPricing = (items: any[], customer: any) => ({ total: 100 });
const processPayment = async (total: number, customer: any, method: any) => ({
  id: "123",
});
const updateInventory = async (items: any[]) => {};
const createOrder = async (
  data: any,
  customer: any,
  pricing: any,
  payment: any,
) => ({ id: "456" });
const sendOrderNotifications = async (customer: any, order: any) => {};
const getUserRegistrationData = () => ({});
const validateUserData = (data: any) => data;
const processWithWelcomeEmail = (data: any) => data;
const processWithoutWelcomeEmail = (data: any) => data;
const processUserInput = async (input: any) => input;

const db = {
  findCustomer: async (id: string) => ({ id }),
  findProduct: async (id: string) => ({
    id,
    price: 10,
    stock: 5,
    active: true,
  }),
  updateProductStock: async (id: string, change: number) => {},
  createOrder: async (data: any) => ({ id: "789" }),
};

const paymentProcessor = {
  charge: async (data: any) => ({ success: true, id: "payment-123" }),
};

const emailService = {
  sendOrderConfirmation: async (email: string, order: any) => {},
};

const smsService = {
  sendOrderUpdate: async (phone: string, orderId: string) => {},
};

const api = {
  getData: async (id: string) => ({ id, data: "test" }),
};

const MySQL = {
  query: async (sql: string, params: any[]) => ({ id: 1 }),
};

const SendGrid = {
  sendEmail: async (data: any) => {},
};

interface User {
  id: string;
  name: string;
}
