# Code Complexity Reduction Guide

## Table of Contents

1. [Complexity Reduction Prompt Template](#complexity-reduction-prompt-template)
2. [Current Complexity Issues:](#current-complexity-issues)
3. [Code Details:](#code-details)
4. [Specific Issues:](#specific-issues)
5. [Complexity Reduction Strategies](#complexity-reduction-strategies)
  6. [1. Function Decomposition](#1-function-decomposition)
    7. [Breaking Down Large Functions](#breaking-down-large-functions)
  8. [2. Conditional Logic Simplification](#2-conditional-logic-simplification)
    9. [Replace Complex If-Else with Strategy Pattern](#replace-complex-if-else-with-strategy-pattern)
    10. [Early Returns to Reduce Nesting](#early-returns-to-reduce-nesting)
  11. [3. React Component Simplification](#3-react-component-simplification)
    12. [Component Decomposition](#component-decomposition)
  13. [4. Data Structure Simplification](#4-data-structure-simplification)
    14. [Flatten Nested Data Structures](#flatten-nested-data-structures)
  15. [5. Error Handling Simplification](#5-error-handling-simplification)
    16. [Centralized Error Handling](#centralized-error-handling)
17. [Complexity Metrics and Guidelines](#complexity-metrics-and-guidelines)
  18. [1. Measurable Complexity Indicators](#1-measurable-complexity-indicators)
    19. [Cyclomatic Complexity](#cyclomatic-complexity)
    20. [Lines of Code](#lines-of-code)
    21. [Nesting Depth](#nesting-depth)
  22. [2. Complexity Reduction Checklist](#2-complexity-reduction-checklist)
    23. [Function-Level](#function-level)
    24. [Component-Level](#component-level)
    25. [Architecture-Level](#architecture-level)
  26. [3. Refactoring Patterns](#3-refactoring-patterns)
    27. [Extract Method](#extract-method)
    28. [Replace Conditional with Polymorphism](#replace-conditional-with-polymorphism)
29. [Common Complexity Anti-Patterns](#common-complexity-anti-patterns)
  30. [1. God Functions/Components](#1-god-functionscomponents)
  31. [2. Deep Nesting](#2-deep-nesting)
  32. [3. Code Duplication](#3-code-duplication)
  33. [4. Magic Numbers/Strings](#4-magic-numbersstrings)
34. [Complexity Reduction Benefits](#complexity-reduction-benefits)
  35. [1. Maintainability](#1-maintainability)
  36. [2. Testability](#2-testability)
  37. [3. Performance](#3-performance)
  38. [4. Team Collaboration](#4-team-collaboration)

## Complexity Reduction Prompt Template

```text
I need to reduce the complexity of [COMPONENT/FUNCTION]. Please help me simplify and refactor this code:

## Current Complexity Issues:
- [ ] Function/component too long (>50 lines)
- [ ] Too many responsibilities
- [ ] Deep nesting (>3 levels)
- [ ] Complex conditional logic
- [ ] Repeated code patterns
- [ ] Hard to understand/maintain

## Code Details:
- Function/Component: [Name and file path]
- Current length: [X] lines
- Cyclomatic complexity: [X] (if known)
- Dependencies: [List of dependencies]
- Use cases: [How it's used]

## Specific Issues:
- [Describe specific complexity problems]
- [Mention areas that are hard to understand]
- [Note any repeated patterns]

Please provide refactoring suggestions with specific examples.
```

## Complexity Reduction Strategies

### 1. Function Decomposition

#### Breaking Down Large Functions

```typescript
// ❌ Large, complex function
const processUserData = (userData: any) => {
  // Validation logic (15 lines)
  if (!userData) {
    throw new Error("User data is required");
  }
  if (!userData.email || !userData.email.includes("@")) {
    throw new Error("Valid email is required");
  }
  if (!userData.name || userData.name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  // Data transformation (20 lines)
  const normalizedEmail = userData.email.toLowerCase().trim();
  const capitalizedName = userData.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Business logic (25 lines)
  const userPermissions = [];
  if (userData.role === "admin") {
    userPermissions.push("read", "write", "delete", "admin");
  } else if (userData.role === "editor") {
    userPermissions.push("read", "write");
  } else {
    userPermissions.push("read");
  }

  // Database operations (15 lines)
  const existingUser = findUserByEmail(normalizedEmail);
  if (existingUser) {
    return updateUser(existingUser.id, {
      name: capitalizedName,
      permissions: userPermissions,
    });
  } else {
    return createUser({
      email: normalizedEmail,
      name: capitalizedName,
      permissions: userPermissions,
    });
  }
};

// ✅ Decomposed into focused functions
const validateUserData = (userData: any): void => {
  if (!userData) {
    throw new Error("User data is required");
  }
  if (!userData.email || !userData.email.includes("@")) {
    throw new Error("Valid email is required");
  }
  if (!userData.name || userData.name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }
};

const transformUserData = (userData: any) => {
  return {
    email: userData.email.toLowerCase().trim(),
    name: userData.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  };
};

const getUserPermissions = (role: string): string[] => {
  const rolePermissions = {
    admin: ["read", "write", "delete", "admin"],
    editor: ["read", "write"],
    user: ["read"],
  };

  return rolePermissions[role] || rolePermissions.user;
};

const upsertUser = async (email: string, userData: any) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return updateUser(existingUser.id, userData);
  }

  return createUser(userData);
};

const processUserData = async (userData: any) => {
  validateUserData(userData);

  const transformedData = transformUserData(userData);
  const permissions = getUserPermissions(userData.role);

  return upsertUser(transformedData.email, {
    ...transformedData,
    permissions,
  });
};
```

### 2. Conditional Logic Simplification

#### Replace Complex If-Else with Strategy Pattern

```typescript
// ❌ Complex conditional logic
const calculateShipping = (order: Order) => {
  if (
    order.type === "express" &&
    order.weight < 5 &&
    order.destination === "domestic"
  ) {
    return order.total * 0.15 + 10;
  } else if (
    order.type === "express" &&
    order.weight < 5 &&
    order.destination === "international"
  ) {
    return order.total * 0.25 + 25;
  } else if (
    order.type === "express" &&
    order.weight >= 5 &&
    order.destination === "domestic"
  ) {
    return order.total * 0.2 + 15;
  } else if (
    order.type === "express" &&
    order.weight >= 5 &&
    order.destination === "international"
  ) {
    return order.total * 0.3 + 35;
  } else if (order.type === "standard" && order.destination === "domestic") {
    return order.total * 0.05 + 5;
  } else if (
    order.type === "standard" &&
    order.destination === "international"
  ) {
    return order.total * 0.1 + 15;
  } else {
    return 0;
  }
};

// ✅ Strategy pattern with lookup table
interface ShippingStrategy {
  rate: number;
  baseFee: number;
}

const shippingStrategies: Record<string, ShippingStrategy> = {
  "express-light-domestic": { rate: 0.15, baseFee: 10 },
  "express-light-international": { rate: 0.25, baseFee: 25 },
  "express-heavy-domestic": { rate: 0.2, baseFee: 15 },
  "express-heavy-international": { rate: 0.3, baseFee: 35 },
  "standard-domestic": { rate: 0.05, baseFee: 5 },
  "standard-international": { rate: 0.1, baseFee: 15 },
};

const getShippingKey = (order: Order): string => {
  const weight = order.weight < 5 ? "light" : "heavy";
  const parts = [order.type, order.destination];

  if (order.type === "express") {
    parts.splice(1, 0, weight);
  }

  return parts.join("-");
};

const calculateShipping = (order: Order): number => {
  const key = getShippingKey(order);
  const strategy = shippingStrategies[key];

  if (!strategy) {
    return 0;
  }

  return order.total * strategy.rate + strategy.baseFee;
};
```

#### Early Returns to Reduce Nesting

```typescript
// ❌ Deeply nested conditions
const processOrder = (order: Order) => {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.customer) {
        if (order.customer.paymentMethod) {
          if (order.total > 0) {
            // Process order logic
            return {
              success: true,
              orderId: generateOrderId(),
              total: order.total,
            };
          } else {
            return { success: false, error: "Invalid order total" };
          }
        } else {
          return { success: false, error: "Payment method required" };
        }
      } else {
        return { success: false, error: "Customer information required" };
      }
    } else {
      return { success: false, error: "Order must contain items" };
    }
  } else {
    return { success: false, error: "Order is required" };
  }
};

// ✅ Early returns reduce nesting
const processOrder = (order: Order) => {
  if (!order) {
    return { success: false, error: "Order is required" };
  }

  if (!order.items || order.items.length === 0) {
    return { success: false, error: "Order must contain items" };
  }

  if (!order.customer) {
    return { success: false, error: "Customer information required" };
  }

  if (!order.customer.paymentMethod) {
    return { success: false, error: "Payment method required" };
  }

  if (order.total <= 0) {
    return { success: false, error: "Invalid order total" };
  }

  // Process order logic
  return {
    success: true,
    orderId: generateOrderId(),
    total: order.total,
  };
};
```

### 3. React Component Simplification

#### Component Decomposition

```typescript
// ❌ Large, complex component
const UserDashboard = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [userData, userPosts, userFollowers] = await Promise.all([
          fetchUser(userId),
          fetchUserPosts(userId),
          fetchUserFollowers(userId)
        ]);
        setUser(userData);
        setPosts(userPosts);
        setFollowers(userFollowers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await updateUser(userId, editForm);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="dashboard">
      {/* Profile section */}
      <div className="profile-section">
        {isEditing ? (
          <div className="edit-form">
            <input
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Name"
            />
            <textarea
              value={editForm.bio}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Bio"
            />
            <input
              value={editForm.location}
              onChange={e => setEditForm({ ...editForm, location: e.target.value })}
              placeholder="Location"
            />
            <button onClick={handleSaveProfile}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="profile-display">
            <h1>{user.name}</h1>
            <p>{user.bio}</p>
            <p>{user.location}</p>
            <button onClick={handleEditProfile}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* Posts section */}
      <div className="posts-section">
        <h2>Posts ({posts.length})</h2>
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Followers section */}
      <div className="followers-section">
        <h2>Followers ({followers.length})</h2>
        {followers.map(follower => (
          <div key={follower.id} className="follower">
            <img src={follower.avatar} alt={follower.name} />
            <span>{follower.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Decomposed into focused components
const UserProfile = ({ user, onEdit }: { user: User; onEdit: () => void }) => (
  <div className="profile-display">
    <h1>{user.name}</h1>
    <p>{user.bio}</p>
    <p>{user.location}</p>
    <button onClick={onEdit}>Edit Profile</button>
  </div>
);

const UserProfileEditor = ({
  user,
  onSave,
  onCancel
}: {
  user: User;
  onSave: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="edit-form">
      <input
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <textarea
        value={formData.bio}
        onChange={e => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Bio"
      />
      <input
        value={formData.location}
        onChange={e => setFormData({ ...formData, location: e.target.value })}
        placeholder="Location"
      />
      <button onClick={handleSubmit}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

const UserPosts = ({
  posts,
  onDelete
}: {
  posts: Post[];
  onDelete: (id: string) => void;
}) => (
  <div className="posts-section">
    <h2>Posts ({posts.length})</h2>
    {posts.map(post => (
      <div key={post.id} className="post">
        <h3>{post.title}</h3>
        <p>{post.content}</p>
        <button onClick={() => onDelete(post.id)}>Delete</button>
      </div>
    ))}
  </div>
);

const UserFollowers = ({ followers }: { followers: User[] }) => (
  <div className="followers-section">
    <h2>Followers ({followers.length})</h2>
    {followers.map(follower => (
      <div key={follower.id} className="follower">
        <img src={follower.avatar} alt={follower.name} />
        <span>{follower.name}</span>
      </div>
    ))}
  </div>
);

// Custom hooks for data management
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const updateUserData = async (data: any) => {
    try {
      const updatedUser = await updateUser(userId, data);
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    }
  };

  return { user, loading, error, updateUser: updateUserData };
};

const useUserPosts = (userId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchUserPosts(userId).then(setPosts);
  }, [userId]);

  const deletePost = async (postId: string) => {
    try {
      await deletePostAPI(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return { posts, deletePost };
};

// Simplified main component
const UserDashboard = ({ userId }: { userId: string }) => {
  const { user, loading, error, updateUser } = useUserData(userId);
  const { posts, deletePost } = useUserPosts(userId);
  const [followers, setFollowers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserFollowers(userId).then(setFollowers);
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  const handleSaveProfile = (data: any) => {
    updateUser(data);
    setIsEditing(false);
  };

  return (
    <div className="dashboard">
      {isEditing ? (
        <UserProfileEditor
          user={user}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <UserProfile user={user} onEdit={() => setIsEditing(true)} />
      )}

      <UserPosts posts={posts} onDelete={deletePost} />
      <UserFollowers followers={followers} />
    </div>
  );
};
```

### 4. Data Structure Simplification

#### Flatten Nested Data Structures

```typescript
// ❌ Complex nested structure
interface ComplexUser {
  personal: {
    name: {
      first: string;
      last: string;
      display: string;
    };
    contact: {
      email: {
        primary: string;
        secondary?: string;
        verified: boolean;
      };
      phone: {
        mobile?: string;
        home?: string;
        verified: boolean;
      };
    };
  };
  preferences: {
    ui: {
      theme: "light" | "dark";
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
    };
  };
}

// ✅ Flattened structure
interface SimpleUser {
  // Personal info
  firstName: string;
  lastName: string;
  displayName: string;

  // Contact info
  primaryEmail: string;
  secondaryEmail?: string;
  emailVerified: boolean;
  mobilePhone?: string;
  homePhone?: string;
  phoneVerified: boolean;

  // Preferences
  theme: "light" | "dark";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}
```

### 5. Error Handling Simplification

#### Centralized Error Handling

```typescript
// ❌ Scattered error handling
const fetchUserData = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found");
      } else if (response.status === 403) {
        throw new Error("Access denied");
      } else if (response.status >= 500) {
        throw new Error("Server error");
      } else {
        throw new Error("Request failed");
      }
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error");
    }
    throw error;
  }
};

// ✅ Centralized error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    highly(message);
    this.name = "ApiError";
  }
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorMap = {
      404: { message: "Resource not found", code: "NOT_FOUND" },
      403: { message: "Access denied", code: "FORBIDDEN" },
      401: { message: "Authentication required", code: "UNAUTHORIZED" },
      500: { message: "Server error", code: "SERVER_ERROR" },
    };

    const error = errorMap[response.status] || {
      message: "Request failed",
      code: "REQUEST_FAILED",
    };

    throw new ApiError(error.message, response.status, error.code);
  }

  return response.json();
};

const apiRequest = async (url: string) => {
  try {
    const response = await fetch(url);
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError("Network error", 0, "NETWORK_ERROR");
    }
    throw error;
  }
};

const fetchUserData = (userId: string) => {
  return apiRequest(`/api/users/${userId}`);
};
```

## Complexity Metrics and Guidelines

### 1. Measurable Complexity Indicators

#### Cyclomatic Complexity

- **Low (1-10)**: Simple, easy to test and maintain
- **Moderate (11-20)**: More complex, requires careful testing
- **High (21-50)**: Complex, hard to test and maintain
- **Very High (>50)**: Should be refactored immediately

#### Lines of Code

- **Functions**: Aim for <20 lines, max 50 lines
- **Components**: Aim for <100 lines, max 200 lines
- **Files**: Aim for <300 lines, max 500 lines

#### Nesting Depth

- **Maximum 3 levels**: Deeper nesting indicates need for refactoring
- **Use early returns**: Reduce nesting with guard clauses
- **Extract functions**: Move nested logic to separate functions

### 2. Complexity Reduction Checklist

#### Function-Level

- [ ] **Single Responsibility**: Function does one thing well
- [ ] **Pure Functions**: No side effects when possible
- [ ] **Clear Naming**: Function name describes what it does
- [ ] **Limited Parameters**: Maximum 3-4 parameters
- [ ] **Early Returns**: Use guard clauses to reduce nesting

#### Component-Level

- [ ] **Single Concern**: Component has one responsibility
- [ ] **Prop Interface**: Clear, minimal prop interface
- [ ] **State Management**: Local state only when needed
- [ ] **Hook Extraction**: Custom hooks for complex logic
- [ ] **Render Logic**: Minimal logic in render method

#### Architecture-Level

- [ ] **Separation of Concerns**: Clear boundaries between layers
- [ ] **Dependency Direction**: Dependencies point inward
- [ ] **Interface Segregation**: Small, focused interfaces
- [ ] **Composition**: Prefer composition over inheritance

### 3. Refactoring Patterns

#### Extract Method

```typescript
// ❌ Long method with multiple responsibilities
const processOrder = (order: Order) => {
  // Validation (10 lines)
  // Calculation (15 lines)
  // Database operations (20 lines)
  // Notification (10 lines)
};

// ✅ Extracted methods
const processOrder = (order: Order) => {
  validateOrder(order);
  const total = calculateOrderTotal(order);
  const savedOrder = saveOrderToDatabase(order, total);
  sendOrderNotification(savedOrder);
  return savedOrder;
};
```

#### Replace Conditional with Polymorphism

```typescript
// ❌ Complex conditionals
const calculateDiscount = (customer: Customer, order: Order) => {
  if (customer.type === "premium") {
    return order.total * 0.2;
  } else if (customer.type === "gold") {
    return order.total * 0.15;
  } else if (customer.type === "silver") {
    return order.total * 0.1;
  } else {
    return 0;
  }
};

// ✅ Polymorphic approach
interface DiscountStrategy {
  calculate(order: Order): number;
}

class PremiumDiscount implements DiscountStrategy {
  calculate(order: Order) {
    return order.total * 0.2;
  }
}

class GoldDiscount implements DiscountStrategy {
  calculate(order: Order) {
    return order.total * 0.15;
  }
}

class SilverDiscount implements DiscountStrategy {
  calculate(order: Order) {
    return order.total * 0.1;
  }
}

const discountStrategies = {
  premium: new PremiumDiscount(),
  gold: new GoldDiscount(),
  silver: new SilverDiscount(),
};

const calculateDiscount = (customer: Customer, order: Order) => {
  const strategy = discountStrategies[customer.type];
  return strategy ? strategy.calculate(order) : 0;
};
```

## Common Complexity Anti-Patterns

### 1. God Functions/Components

- Functions that do too many things
- Components with too many responsibilities
- Classes with too many methods

### 2. Deep Nesting

- Multiple levels of if-else statements
- Nested loops within loops
- Callback hell in async operations

### 3. Code Duplication

- Copy-paste programming
- Similar logic in multiple places
- Lack of abstraction

### 4. Magic Numbers/Strings

- Hardcoded values throughout code
- Unclear constants
- Business rules embedded in code

## Complexity Reduction Benefits

### 1. Maintainability

- Easier to understand and modify
- Reduced risk of introducing bugs
- Faster development iterations

### 2. Testability

- Easier to write unit tests
- Better test coverage
- More reliable testing

### 3. Performance

- Easier to optimize
- Better debugging capabilities
- Reduced cognitive load

### 4. Team Collaboration

- Easier onboarding for new developers
- Better code reviews
- Consistent coding standards
