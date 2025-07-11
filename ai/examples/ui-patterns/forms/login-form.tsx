import React, { useState } from "react";
import { z } from "zod";
import styles from "./login-form.module.css";

// Validation schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

/**
 * Login Form Pattern
 *
 * Features:
 * - Client-side validation with Zod
 * - Accessible error messages
 * - Loading states during submission
 * - Remember me functionality
 * - Password visibility toggle
 * - Keyboard navigation support
 * - Server error handling
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (field: keyof LoginFormData, value: any) => {
    try {
      const fieldSchema = loginSchema.shape[field];
      fieldSchema.parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "rememberMe" ? e.target.checked : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
      setServerError(null); // Clear server error on input change
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entire form
    try {
      const validatedData = loginSchema.parse(formData);
      setErrors({});
      setServerError(null);
      setIsSubmitting(true);

      try {
        await onSubmit(validatedData);
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
      aria-label="Login form"
    >
      <h2 className={styles.title}>Welcome Back</h2>

      {serverError && (
        <div className={styles.serverError} role="alert" aria-live="polite">
          {serverError}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="you@example.com"
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span id="email-error" className={styles.error} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isSubmitting}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className={styles.error} role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <div className={styles.rememberForgot}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange("rememberMe")}
            disabled={isSubmitting}
          />
          <span>Remember me</span>
        </label>

        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className={styles.forgotLink}
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {onSignUp && (
        <p className={styles.signUpPrompt}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignUp}
            className={styles.signUpLink}
            disabled={isSubmitting}
          >
            Sign up
          </button>
        </p>
      )}
    </form>
  );
};

// Example CSS Module (login-form.module.css)
/*
.form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.serverError {
  background-color: var(--color-error-background);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-error);
}

.field {
  margin-bottom: var(--spacing-md);
}

.label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
}

.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all 0.2s;
  background: var(--color-background);
  color: var(--color-text);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-background-disabled);
}

.inputError {
  border-color: var(--color-error);
}

.inputError:focus {
  box-shadow: 0 0 0 3px var(--color-error-alpha);
}

.error {
  display: block;
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.passwordWrapper {
  position: relative;
}

.passwordToggle {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.passwordToggle:hover {
  color: var(--color-text);
}

.passwordToggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.rememberForgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.checkbox input {
  cursor: pointer;
}

.forgotLink,
.signUpLink {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-size: var(--font-size-sm);
  padding: 0;
}

.forgotLink:hover,
.signUpLink:hover {
  color: var(--color-primary-dark);
}

.forgotLink:focus-visible,
.signUpLink:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.submitButton {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.submitButton:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.submitButton:active:not(:disabled) {
  transform: translateY(0);
}

.submitButton:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.signUpPrompt {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 640px) {
  .form {
    padding: var(--spacing-lg);
  }
}
*/
