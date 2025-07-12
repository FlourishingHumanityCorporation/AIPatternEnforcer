// ❌ ANTI-PATTERN: Code Generation Mistakes
// Common errors Claude Code instances make when generating code

// SEVERITY: HIGH - These mistakes reduce code quality and violate project standards

// ❌ BAD: Using console.log instead of proper logging
// NEVER do this in production code:
function badLogging() {
  console.log("User logged in");           // ❌ Not allowed in production
  console.error("Auth failed");           // ❌ Use proper error handling
  console.warn("Deprecated API");         // ❌ Use logging framework
  console.debug("Debug info");            // ❌ Use debug utilities
}

// ✅ CORRECT: Use proper logging
import { getLogger } from '../utils/logger';
const logger = getLogger(__name__);

function goodLogging() {
  logger.info("User logged in");           // ✅ Proper logging
  logger.error("Auth failed", { error }); // ✅ Structured logging
  logger.warn("Deprecated API usage");     // ✅ Warning level
  logger.debug("Debug information");      // ✅ Debug level
}

// ❌ BAD: Bare except clauses without specific exception types
// NEVER catch all exceptions blindly:
async function badErrorHandling() {
  try {
    await riskyOperation();
  } catch (e) {                           // ❌ Too broad, hides bugs
    return null;
  }
  
  try {
    await anotherOperation();
  } catch {                               // ❌ Even worse - ignores error
    // Silent failure
  }
}

// ✅ CORRECT: Specific exception handling
async function goodErrorHandling() {
  try {
    await riskyOperation();
  } catch (error) {
    if (error instanceof NetworkError) {   // ✅ Specific error type
      logger.error("Network failure", { error });
      throw new UserFriendlyError("Connection lost");
    }
    if (error instanceof ValidationError) { // ✅ Handle known errors
      return { success: false, errors: error.details };
    }
    // ✅ Re-throw unknown errors
    logger.error("Unexpected error", { error });
    throw error;
  }
}

// ❌ BAD: Not using generators for component creation
// NEVER manually create components when generators exist:

// ❌ Manual component creation (violates CLAUDE.md rule):
/*
// Manually creating UserCard.tsx without using generator
import React from 'react';

export const UserCard = () => {
  return <div>User info</div>;
};
*/

// ✅ CORRECT: Always use generators
// Use: npm run g:c UserCard
// This creates:
// - UserCard.tsx (with proper structure)
// - UserCard.test.tsx (with comprehensive tests)
// - UserCard.module.css (with styled components)
// - UserCard.stories.tsx (for Storybook)
// - index.ts (for clean exports)

// ❌ BAD: Ignoring TypeScript types and safety
// NEVER use 'any' or skip type definitions:
function badTyping(data: any) {           // ❌ Loses type safety
  return data.someProperty;               // ❌ No intellisense/checking
}

const badComponent = (props: any) => {    // ❌ Props not typed
  return <div>{props.value}</div>;        // ❌ Runtime errors possible
};

// ✅ CORRECT: Proper TypeScript usage
interface UserData {
  id: string;
  name: string;
  email: string;
}

function goodTyping(data: UserData): string {  // ✅ Strong types
  return data.name;                           // ✅ Type-safe access
}

interface UserCardProps {
  user: UserData;
  onClick?: (id: string) => void;
}

const GoodComponent: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div onClick={() => onClick?.(user.id)}>  {/* ✅ Type-safe */}
      {user.name}
    </div>
  );
};

// ❌ BAD: Not following test-first development
// NEVER write code without tests:
function untested() {                     // ❌ No tests written
  // Complex logic here
  return complexCalculation();
}

// ✅ CORRECT: Test-first development
// 1. Write tests first
describe('calculateUserScore', () => {
  it('should calculate score correctly', () => {
    expect(calculateUserScore({ points: 100 })).toBe(100);
  });
  
  it('should handle edge cases', () => {
    expect(calculateUserScore({ points: 0 })).toBe(0);
    expect(calculateUserScore({ points: -10 })).toBe(0);
  });
});

// 2. Then implement to make tests pass
function calculateUserScore(user: { points: number }): number {
  return Math.max(0, user.points);
}

// ❌ BAD: Security vulnerabilities
// NEVER create insecure code:
function insecureAuth(token: string) {
  // ❌ No validation
  const decoded = JSON.parse(atob(token));  // ❌ No verification
  return decoded.userId;                    // ❌ Trusts client data
}

function unsafeHTML(content: string) {
  // ❌ XSS vulnerability
  document.innerHTML = content;
}

// ✅ CORRECT: Security-first approach
import { validateToken, sanitizeHTML } from '../utils/security';

function secureAuth(token: string): string | null {
  try {
    const decoded = validateToken(token);   // ✅ Proper validation
    return decoded.userId;
  } catch (error) {
    logger.warn("Invalid token", { error });
    return null;
  }
}

function safeHTML(content: string) {
  const sanitized = sanitizeHTML(content); // ✅ Sanitize input
  document.innerHTML = sanitized;
}

// ❌ BAD: Performance anti-patterns
// NEVER ignore performance implications:
function inefficientRender() {
  const users = getUsers();
  return users.map(user => (            // ❌ No memoization
    <ExpensiveComponent 
      key={user.id} 
      data={expensiveCalculation(user)}  // ❌ Recalculates every render
    />
  ));
}

// ✅ CORRECT: Performance-conscious code
import { useMemo, memo } from 'react';

const EfficientComponent = memo(({ users }: { users: User[] }) => {
  const processedUsers = useMemo(() =>   // ✅ Memoized calculation
    users.map(user => expensiveCalculation(user)),
    [users]
  );
  
  return processedUsers.map((data, index) => (
    <ExpensiveComponent 
      key={users[index].id} 
      data={data}
    />
  ));
});

// KEY REMINDERS FOR CLAUDE CODE:
// 1. Always use generators: npm run g:c ComponentName
// 2. Never use console.log - use proper logging
// 3. Always specify exception types in try/catch
// 4. Write tests before implementation
// 5. Include security considerations by default
// 6. Use proper TypeScript types
// 7. Consider performance implications
// 8. Edit existing files, don't create versions