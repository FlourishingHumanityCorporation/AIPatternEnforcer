/**
 * Example App demonstrating the design system and UI patterns
 * This shows how the pieces work together
 */

import React, { useState } from "react";
import { LoginForm } from "../../ai/examples/ui-patterns/forms/login-form";
import type { z } from "zod";

// Import the design system
import "../styles/index.css";

// Mock login function
async function handleLogin(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success or failure
  if (data.email === "test@example.com" && data.password === "Password123") {
    console.log("Login successful!", data);
    alert("Login successful! Check console for details.");
  } else {
    throw new Error("Invalid email or password");
  }
}

export function ExampleApp() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background-dark)",
        padding: "var(--spacing-xl)",
        fontFamily: "var(--font-family-sans)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "var(--font-size-3xl)",
            color: "var(--color-text-dark)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          ProjectTemplate Design System Demo
        </h1>

        <p
          style={{
            color: "var(--color-text-muted)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          This demonstrates the design tokens and UI patterns working together.
        </p>

        <div
          style={{
            display: "grid",
            gap: "var(--spacing-xl)",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {/* Design Tokens Demo */}
          <div
            style={{
              padding: "var(--spacing-lg)",
              backgroundColor: "var(--color-background)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                marginBottom: "var(--spacing-md)",
              }}
            >
              Design Tokens
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
              }}
            >
              <div
                style={{
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Primary Color
              </div>

              <div
                style={{
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Error Color
              </div>

              <div
                style={{
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--color-success)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Success Color
              </div>
            </div>
          </div>

          {/* Component Generator Demo */}
          <div
            style={{
              padding: "var(--spacing-lg)",
              backgroundColor: "var(--color-background)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                marginBottom: "var(--spacing-md)",
              }}
            >
              Component Generator
            </h2>

            <p
              style={{
                color: "var(--color-text-muted)",
                marginBottom: "var(--spacing-md)",
              }}
            >
              Generate consistent components:
            </p>

            <pre
              style={{
                backgroundColor: "var(--color-background-dark)",
                padding: "var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                overflow: "auto",
              }}
            >
              <code>{`npm run g:c MyComponent

Choose template:
- Interactive
- Display
- Form ✓
- Data
- Overlay`}</code>
            </pre>
          </div>
        </div>

        {/* Login Form Demo */}
        {showLogin && (
          <div style={{ marginTop: "var(--spacing-xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                marginBottom: "var(--spacing-md)",
                textAlign: "center",
              }}
            >
              Login Form Pattern Demo
            </h2>

            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              Try: test@example.com / Password123
            </p>

            <LoginForm
              onSubmit={handleLogin}
              onForgotPassword={() => alert("Forgot password clicked")}
              onSignUp={() => alert("Sign up clicked")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
