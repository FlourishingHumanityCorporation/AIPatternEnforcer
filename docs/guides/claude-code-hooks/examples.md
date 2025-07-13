# Claude Code Hooks Examples

This document provides practical examples of how each hook works, including real scenarios where they prevent issues and improve code quality.

## Table of Contents

- [Security Scan Examples](#security-scan-examples)
- [Scope Limiter Examples](#scope-limiter-examples)
- [Context Validator Examples](#context-validator-examples)
- [API Validator Examples](#api-validator-examples)
- [Performance Checker Examples](#performance-checker-examples)
- [Test First Enforcer Examples](#test-first-enforcer-examples)

## Security Scan Examples

### XSS Prevention

**❌ Blocked Operation**:
```javascript
// User input directly inserted into DOM
function updateUserProfile(userData) {
  document.getElementById('profile').innerHTML = `
    <h2>Welcome ${userData.name}</h2>
    <p>Bio: ${userData.bio}</p>
  `;
}
```

**Hook Response**:
```
🔒 Security issues detected in profile.js:

🔴 Critical Issues:
1. ❌ XSS vulnerability: innerHTML with user data
   ✅ Use textContent or sanitize with DOMPurify

💡 Fix critical issues before proceeding.
📖 See docs/guides/security/ for security guidelines
```

**✅ Corrected Code**:
```javascript
function updateUserProfile(userData) {
  const profileElement = document.getElementById('profile');
  const title = document.createElement('h2');
  const bio = document.createElement('p');
  
  title.textContent = `Welcome ${userData.name}`;
  bio.textContent = `Bio: ${userData.bio}`;
  
  profileElement.appendChild(title);
  profileElement.appendChild(bio);
}
```

### Code Injection Prevention

**❌ Blocked Operation**:
```javascript
// Dynamic code execution from user input
function processFormula(userFormula) {
  try {
    const result = eval(`(${userFormula})`);
    return result;
  } catch (error) {
    return 'Invalid formula';
  }
}
```

**Hook Response**:
```
🔒 Security issues detected in calculator.js:

🔴 Critical Issues:
1. ❌ Code injection: eval() with user input
   ✅ Use a math parser library like mathjs or create a safe expression evaluator
```

**✅ Corrected Code**:
```javascript
import { evaluate } from 'mathjs';

function processFormula(userFormula) {
  try {
    // mathjs safely evaluates mathematical expressions
    const result = evaluate(userFormula);
    return result;
  } catch (error) {
    return 'Invalid formula';
  }
}
```

### API Key Exposure Prevention

**❌ Blocked Operation**:
```javascript
// Hardcoded API key in client-side code
const config = {
  apiKey: 'sk-1234567890abcdefghijklmnop',
  endpoint: 'https://api.example.com'
};

function fetchData() {
  return fetch(config.endpoint, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
}
```

**Hook Response**:
```
🔒 Security issues detected in api-client.js:

🔴 Critical Issues:  
1. ❌ Hardcoded API key detected
   ✅ Move to environment variables: process.env.API_KEY
```

**✅ Corrected Code**:
```javascript
const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  endpoint: process.env.REACT_APP_API_ENDPOINT
};

function fetchData() {
  if (!config.apiKey) {
    throw new Error('API key not configured');
  }
  
  return fetch(config.endpoint, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
}
```

## Scope Limiter Examples

### Overly Complex Request

**❌ Blocked Prompt**:
```
"Create a comprehensive e-commerce platform with user authentication, 
product catalog management, shopping cart functionality, payment processing, 
order tracking, inventory management, admin dashboard, analytics reporting, 
email notifications, SEO optimization, and mobile responsiveness"
```

**Hook Response**:
```
🎯 Scope too broad for focused development

❌ Issues detected:
• 11 features mentioned (limit: 5)
• Multiple system concerns  
• Complexity score: 9/7

✅ Try instead:
• "Create user authentication with login/logout"
• "Build product catalog with search and filters"  
• "Implement shopping cart with add/remove items"

💡 Break large requests into focused, single-purpose tasks
📖 See docs/guides/scope/ for effective prompting
```

**✅ Focused Request**:
```
"Create a React shopping cart component that allows users to add items, 
remove items, and display the total price. Include TypeScript interfaces 
and basic styling with CSS modules."
```

### Feature Creep Detection

**❌ Blocked Operation**:
```javascript
// Request shows scope creep - multiple unrelated features
const prompt = `
  Create a user dashboard that shows:
  - User profile information
  - Recent orders and order history  
  - Real-time notifications
  - Analytics charts for user behavior
  - Social media integration
  - File upload and document management
  - Chat functionality with support
  - Calendar integration with events
`;
```

**Hook Response**:
```
🎯 Scope too broad for focused development

❌ Issues detected:
• 8 features mentioned (limit: 5)
• Mixed concerns: profile, orders, analytics, social, files, chat, calendar
• Complexity score: 8/7

✅ Break into focused tasks:
• User profile dashboard component
• Order history component  
• Notifications system
• Analytics dashboard
```

**✅ Focused Approach**:
```javascript
// First focused request
const prompt1 = `
  Create a user profile dashboard component that displays:
  - User information (name, email, avatar)
  - Account settings link
  - Profile completion status
  Include edit functionality and TypeScript types.
`;

// Second focused request  
const prompt2 = `
  Create an order history component that shows:
  - List of user's recent orders
  - Order status and details
  - Pagination for older orders
  Integrate with the existing order API.
`;
```

## Context Validator Examples

### Insufficient Context

**❌ Blocked Operation (Context Score: 4/25)**:
```json
{
  "tool": "Write",
  "file_path": "Button.tsx",
  "content": "function Button() { return <button>Click me</button>; }"
}
```

**Hook Response**:
```
🧠 Insufficient context for creating new files

❌ Context score: 4/25 (need more detail)

✅ To improve context:
   📋 Include current project architecture context
   🎯 Reference relevant patterns from ai/examples/
   📝 Specify exact requirements and constraints
   📁 Include context from related files in components/

📖 See ai/prompts/templates/explicit-context.md for examples
```

**✅ Rich Context (Context Score: 22/25)**:
```json
{
  "tool": "Write", 
  "file_path": "components/ui/Button.tsx",
  "prompt": "Create a reusable Button component following the patterns in @components/ui/Card.tsx. Should accept variant props (primary, secondary, danger) and support disabled state. Use the same TypeScript interface pattern and CSS module structure as other UI components.",
  "content": "/* Rich implementation with proper types and patterns */"
}
```

### Good Context Examples

**✅ Architecture Context (18/25 points)**:
```json
{
  "tool": "Write",
  "file_path": "hooks/useAuth.ts", 
  "prompt": "Create authentication hook following the pattern in @hooks/useApi.ts. Should integrate with the existing auth context from @contexts/AuthContext.tsx and use the same error handling patterns.",
  "content": "/* Implementation with architectural alignment */"
}
```

**✅ Integration Context (20/25 points)**:
```json
{
  "tool": "Edit",
  "file_path": "pages/api/users.ts",
  "prompt": "Add user deletion endpoint to existing API following the pattern established in @pages/api/posts.ts. Use the same authentication middleware from @lib/auth.ts and error response format.",
  "old_string": "// existing code",
  "new_string": "/* New endpoint with consistent patterns */"
}
```

**✅ Problem Context (16/25 points)**:
```json
{
  "tool": "Write",
  "file_path": "components/UserForm.tsx",
  "prompt": "User registration form is currently in @pages/register.tsx but needs to be reusable. Extract into component with validation using react-hook-form (already installed). Should handle email, password, confirm password, and show validation errors inline.",
  "content": "/* Extracted, reusable form component */"
}
```

## API Validator Examples

### Missing Import Detection

**❌ Blocked Operation**:
```javascript
// Package not in package.json
import { format } from 'date-fns';
import { debounce } from 'lodash';
import axios from 'axios';

function formatUserDate(date) {
  return format(date, 'yyyy-MM-dd');
}
```

**Hook Response** (if packages not installed):
```
🔍 API validation issues in utils.js:

1. ❌ Package not found: "date-fns"
   ✅ Install package: npm install date-fns

2. ❌ Package not found: "lodash"  
   ✅ Install package: npm install lodash

💡 Fix these issues to prevent runtime errors.
📖 See docs/references/api/verified-apis.md for approved APIs
```

### Hallucinated API Detection

**❌ Blocked Operation**:
```javascript
// Non-existent React hook
import { useServerState, useAutoSave } from 'react';

function Component() {
  const [data, setData] = useServerState('/api/data');
  const saveData = useAutoSave(data);
  
  return <div>{data}</div>;
}
```

**Hook Response**:
```
🔍 API validation issues in Component.tsx:

1. ❌ useServerState is not a real React hook
   ✅ Use useState, useEffect, or a data fetching library

2. ❌ useAutoSave is not a real React hook  
   ✅ Implement auto-save functionality explicitly

💡 Fix these issues to prevent runtime errors.
```

### Relative Import Validation

**❌ Blocked Operation** (if files don't exist):
```javascript
// Missing relative imports
import { UserCard } from './components/UserCard';
import { formatDate } from '../utils/dateUtils';
import config from '../../config/database';
```

**Hook Response**:
```
🔍 API validation issues in dashboard.js:

1. ❌ Import: "./components/UserCard" not found
   ✅ Create file or fix path: ./components/UserCard

2. ❌ Import: "../utils/dateUtils" not found
   ✅ Create file or fix path: ../utils/dateUtils
```

### API Endpoint Validation

**❌ Blocked Operation** (if API files don't exist):
```javascript
// API endpoints that don't exist
async function fetchData() {
  const users = await fetch('/api/users');
  const posts = await fetch('/api/posts/featured');
  const analytics = await fetch('/api/analytics/dashboard');
}
```

**Hook Response**:
```
🔍 API validation issues in client.js:

1. ❌ API endpoint: "/api/users" not found
   ✅ Create API file: pages/api/users.ts

2. ❌ API endpoint: "/api/analytics/dashboard" not found
   ✅ Create API file: pages/api/analytics/dashboard.ts
```

## Performance Checker Examples

### O(n²) Algorithm Detection

**❌ Blocked Operation**:
```javascript
// Inefficient nested loop
function findRelatedItems(items) {
  const related = [];
  
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i].categoryId === items[j].categoryId && i !== j) {
        related.push({ item: items[i], related: items[j] });
      }
    }
  }
  
  return related;
}
```

**Hook Response**:
```
⚡ Performance issues detected in utils.js:

🔴 Critical Issues:
1. ❌ Nested loops detected - O(n²) complexity
   ✅ Consider using Map/Set, or single-pass algorithms

💡 Fix critical issues before proceeding.
📖 See docs/guides/performance/ for optimization guides
```

**✅ Optimized Version**:
```javascript
function findRelatedItems(items) {
  // O(n) solution using Map
  const categorized = new Map();
  
  // Group items by category (O(n))
  items.forEach(item => {
    if (!categorized.has(item.categoryId)) {
      categorized.set(item.categoryId, []);
    }
    categorized.get(item.categoryId).push(item);
  });
  
  // Generate related pairs (O(n))
  const related = [];
  categorized.forEach(categoryItems => {
    if (categoryItems.length > 1) {
      for (let i = 0; i < categoryItems.length; i++) {
        for (let j = i + 1; j < categoryItems.length; j++) {
          related.push({ 
            item: categoryItems[i], 
            related: categoryItems[j] 
          });
        }
      }
    }
  });
  
  return related;
}
```

### React Performance Issues

**❌ Blocked Operation**:
```javascript
// Multiple React anti-patterns
function UserList({ users, onUserClick }) {
  const [filter, setFilter] = useState('');
  
  // Missing dependency array - runs on every render
  useEffect(() => {
    document.title = `Users (${users.length})`;
  });
  
  return (
    <div>
      {users
        .filter(user => user.name.includes(filter))
        .map(user => (
          <div 
            key={user.id}
            style={{ padding: '10px', margin: '5px' }} // New object every render
            onClick={() => onUserClick(user.id)} // New function every render
          >
            {user.name}
          </div>
        ))}
    </div>
  );
}
```

**Hook Response**:
```
⚡ Performance issues detected in UserList.tsx:

🔴 Critical Issues:
1. ❌ useEffect without dependency array - runs on every render
   ✅ Add dependency array to useEffect

🟡 Consider Optimizing:
1. Inline styles create new objects on each render
2. Inline arrow function in event handler
```

**✅ Optimized Version**:
```javascript
const styles = {
  userItem: { padding: '10px', margin: '5px' }
};

function UserList({ users, onUserClick }) {
  const [filter, setFilter] = useState('');
  
  useEffect(() => {
    document.title = `Users (${users.length})`;
  }, [users.length]); // Proper dependency array
  
  const handleUserClick = useCallback((userId) => {
    onUserClick(userId);
  }, [onUserClick]);
  
  const filteredUsers = useMemo(() => 
    users.filter(user => user.name.includes(filter)),
    [users, filter]
  );
  
  return (
    <div>
      {filteredUsers.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
}

const UserItem = memo(({ user, onClick }) => (
  <div 
    style={styles.userItem}
    onClick={() => onClick(user.id)}
  >
    {user.name}
  </div>
));
```

### Bundle Size Impact

**❌ Blocked Operation**:
```javascript
// Heavy dependencies  
import moment from 'moment';           // 67kb
import _ from 'lodash';                // 24kb  
import { Chart } from 'chart.js';      // 45kb

function Dashboard({ data }) {
  const formattedDate = moment().format('YYYY-MM-DD');
  const sortedData = _.sortBy(data, 'createdAt');
  
  return (
    <div>
      <h1>Dashboard for {formattedDate}</h1>
      <Chart data={sortedData} />
    </div>
  );
}
```

**Hook Response**:
```
⚡ Performance issues detected in Dashboard.jsx:

📦 Large Bundle Impact: ~15kb estimated

🟡 Consider Optimizing:
1. Moment.js is very large (67kb) - Use date-fns or native Date methods instead
2. Full Lodash import (24kb) - Import specific functions: import { sortBy } from "lodash/sortBy"
```

**✅ Optimized Version**:
```javascript
// Lighter alternatives
import { format } from 'date-fns';     // 2kb
import { sortBy } from 'lodash/sortBy'; // 1kb
import { Chart } from 'chart.js/auto';  // Tree-shakeable

function Dashboard({ data }) {
  const formattedDate = format(new Date(), 'yyyy-MM-dd');
  const sortedData = sortBy(data, 'createdAt');
  
  return (
    <div>
      <h1>Dashboard for {formattedDate}</h1>
      <Chart data={sortedData} />
    </div>
  );
}
```

## Test First Enforcer Examples

### Missing Test File

**❌ Blocked Operation**:
```javascript
// New component without test
// File: components/UserProfile.tsx
import React from 'react';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

**Hook Response**:
```
🧪 Test coverage required for new components

❌ Missing test file for: components/UserProfile.tsx

✅ Create test file: components/__tests__/UserProfile.test.tsx

📋 Required test coverage:
• Component rendering
• Props handling  
• User interaction
• Edge cases

💡 Following test-first development improves code quality
📖 See docs/guides/testing/ for test patterns
```

**✅ Required Test File**:
```javascript
// File: components/__tests__/UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

const mockUser = {
  id: '1',
  name: 'John Doe', 
  email: 'john@example.com'
};

describe('UserProfile', () => {
  test('renders user information', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  test('applies correct CSS class', () => {
    render(<UserProfile user={mockUser} />);
    
    const profile = screen.getByRole('heading', { level: 2 }).closest('div');
    expect(profile).toHaveClass('user-profile');
  });
});
```

### API Route Without Tests

**❌ Blocked Operation**:
```javascript
// File: pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    const user = await getUserById(id as string);
    res.json(user);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

**Hook Response**:
```
🧪 Test coverage required for API routes

❌ Missing test file for: pages/api/users/[id].ts

✅ Create test file: pages/api/users/__tests__/[id].test.ts

📋 Required API test coverage:
• Successful responses
• Error handling
• Method validation
• Parameter validation

💡 API tests prevent runtime failures
```

**✅ Required Test File**:
```javascript
// File: pages/api/users/__tests__/[id].test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../[id]';

describe('/api/users/[id]', () => {
  test('GET returns user data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: '123' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('id', '123');
  });
  
  test('POST returns 405 method not allowed', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: '123' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(405);
  });
});
```

### Utility Function Coverage

**❌ Blocked Operation**:
```javascript
// File: lib/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**Hook Response**:
```
🧪 Test coverage required for utility functions

❌ Missing test file for: lib/validation.ts

✅ Create test file: lib/__tests__/validation.test.ts

📋 Required utility test coverage:
• Function return values
• Edge cases and boundaries
• Invalid input handling
• Error conditions

💡 Utility tests catch edge case bugs
```

**✅ Required Test File**:
```javascript
// File: lib/__tests__/validation.test.ts
import { validateEmail, validatePassword } from '../validation';

describe('validateEmail', () => {
  test('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
  });
  
  test('rejects invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });
});

describe('validatePassword', () => {
  test('accepts strong passwords', () => {
    const result = validatePassword('StrongP@ssw0rd');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('rejects weak passwords', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
    expect(result.errors).toContain('Password must contain uppercase letter');
    expect(result.errors).toContain('Password must contain number');
  });
});
```

## Hook Chain Examples

### Complete Development Flow

**1. Initial Request (Context Validation)**:
```javascript
// ❌ Insufficient context
"Create a login component"

// ✅ Rich context  
"Create login component following @components/auth/SignupForm.tsx patterns. 
Should integrate with @contexts/AuthContext.tsx and use react-hook-form 
for validation. Include email/password fields and error handling."
```

**2. Security Scan**:
```javascript
// ❌ Security issue detected
function login(email, password) {
  const script = document.createElement('script');
  script.innerHTML = `loginUser('${email}', '${password}')`;
  document.body.appendChild(script);
}

// ✅ Secure implementation
function login(email, password) {
  return fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}
```

**3. Performance Check**:
```javascript
// ❌ Performance issue
useEffect(() => {
  setUser(getCurrentUser());
}); // Missing dependency array

// ✅ Optimized
useEffect(() => {
  setUser(getCurrentUser());
}, []); // Proper dependency array
```

**4. API Validation**:
```javascript
// ❌ Missing import
import { useAuthContext } from './AuthContext'; // File doesn't exist

// ✅ Valid import
import { useAuthContext } from '../contexts/AuthContext';
```

**5. Test Enforcement**:
```javascript
// ❌ Missing test file
// Component created without LoginForm.test.tsx

// ✅ Test file created
// components/__tests__/LoginForm.test.tsx with comprehensive tests
```

This example shows how all hooks work together to ensure high-quality, secure, performant, and well-tested code generation through the complete development workflow.