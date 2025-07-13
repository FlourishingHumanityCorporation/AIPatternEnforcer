import React, { useState, useCallback } from "react";
import styles from "./multi-step-form.module.css";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface MultiStepFormProps<T extends Record<string, any>> {
  steps: Step[];
  initialData?: Partial<T>;
  onComplete: (data: T) => Promise<void>;
  children: (props: {
    currentStep: number;
    data: Partial<T>;
    updateData: (updates: Partial<T>) => void;
    errors: Record<string, string>;
    setError: (field: string, error: string) => void;
    clearError: (field: string) => void;
  }) => React.ReactNode;
  validateStep?: (
  step: number,
  data: Partial<T>)
  => Record<string, string> | null;
}

/**
 * Multi-Step Form Pattern
 *
 * Features:
 * - Progress indicator
 * - Step validation before proceeding
 * - Data persistence between steps
 * - Back/Next navigation
 * - Keyboard navigation (Enter to proceed)
 * - Accessible step announcements
 * - Review step before submission
 */
export function MultiStepForm<T extends Record<string, any>>({
  steps,
  initialData = {},
  onComplete,
  children,
  validateStep
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateCurrentStep = (): boolean => {
    if (!validateStep) return true;

    const validationErrors = validateStep(currentStep, data);
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === steps.length - 1) {
      // Final step - submit form
      setIsSubmitting(true);
      try {
        await onComplete(data as T);
      } catch (error) {
        logger.error("Form submission failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mark current step as completed and move to next
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      if (validateCurrentStep()) {
        setCurrentStep(stepIndex);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const progress = (currentStep + 1) / steps.length * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={styles.container} onKeyDown={handleKeyDown}>
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Step ${currentStep + 1} of ${steps.length}`} />

      </div>

      {/* Step Indicators */}
      <nav className={styles.stepIndicators} aria-label="Form steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps.has(index);
          const isClickable = index <= currentStep || isCompleted;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`
                ${styles.stepIndicator}
                ${isActive ? styles.stepActive : ""}
                ${isCompleted ? styles.stepCompleted : ""}
                ${!isClickable ? styles.stepDisabled : ""}
              `}
              disabled={!isClickable}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${step.title}${isCompleted ? " (completed)" : ""}${isActive ? " (current)" : ""}`}>

              <span className={styles.stepNumber}>
                {isCompleted ? "✓" : index + 1}
              </span>
              <span className={styles.stepTitle}>{step.title}</span>
            </button>);

        })}
      </nav>

      {/* Current Step Content */}
      <div className={styles.stepContent}>
        <h2 className={styles.stepHeading}>{steps[currentStep].title}</h2>
        {steps[currentStep].description &&
        <p className={styles.stepDescription}>
            {steps[currentStep].description}
          </p>
        }

        <div className={styles.formContent}>
          {children({
            currentStep,
            data,
            updateData,
            errors,
            setError,
            clearError
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navigation}>
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep || isSubmitting}
          className={`${styles.button} ${styles.buttonSecondary}`}
          aria-label="Go to previous step">

          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className={`${styles.button} ${styles.buttonPrimary}`}
          aria-label={isLastStep ? "Submit form" : "Go to next step"}>

          {isSubmitting ?
          <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Submitting...</span>
            </> :
          isLastStep ?
          "Submit" :

          "Next"
          }
        </button>
      </div>
    </div>);

}

// Example usage with specific form data
interface OnboardingData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;

  // Step 2: Company Info
  companyName: string;
  companySize: string;
  industry: string;

  // Step 3: Preferences
  notifications: boolean;
  newsletter: boolean;
  theme: "light" | "dark";
}

export const OnboardingFormExample: React.FC = () => {
  const steps: Step[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Tell us about yourself"
  },
  {
    id: "company",
    title: "Company Details",
    description: "Tell us about your organization"
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Customize your experience"
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Review your information before submitting"
  }];


  const validateStep = (step: number, data: Partial<OnboardingData>) => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Info
        if (!data.firstName) errors.firstName = "First name is required";
        if (!data.lastName) errors.lastName = "Last name is required";
        if (!data.email) errors.email = "Email is required";else
        if (!/\S+@\S+\.\S+/.test(data.email))
        errors.email = "Invalid email";
        break;

      case 1: // Company Info
        if (!data.companyName) errors.companyName = "Company name is required";
        if (!data.companySize)
        errors.companySize = "Please select company size";
        if (!data.industry) errors.industry = "Please select industry";
        break;

      case 2: // Preferences
        // No required fields
        break;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleComplete = async (data: OnboardingData) => {
    logger.info("Form submitted:", data);
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
  };

  return (
    <MultiStepForm<OnboardingData>
      steps={steps}
      validateStep={validateStep}
      onComplete={handleComplete}>

      {({ currentStep, data, updateData, errors }) => {
        switch (currentStep) {
          case 0:
            return (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    value={data.firstName || ""}
                    onChange={(e) => updateData({ firstName: e.target.value })}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                    } />

                  {errors.firstName &&
                  <span id="firstName-error" className={styles.error}>
                      {errors.firstName}
                    </span>
                  }
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    value={data.lastName || ""}
                    onChange={(e) => updateData({ lastName: e.target.value })}
                    aria-invalid={!!errors.lastName} />

                  {errors.lastName &&
                  <span className={styles.error}>{errors.lastName}</span>
                  }
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => updateData({ email: e.target.value })}
                    aria-invalid={!!errors.email} />

                  {errors.email &&
                  <span className={styles.error}>{errors.email}</span>
                  }
                </div>
              </div>);


          case 1:
            return (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    id="companyName"
                    type="text"
                    value={data.companyName || ""}
                    onChange={(e) =>
                    updateData({ companyName: e.target.value })
                    }
                    aria-invalid={!!errors.companyName} />

                  {errors.companyName &&
                  <span className={styles.error}>{errors.companyName}</span>
                  }
                </div>

                <div className={styles.field}>
                  <label htmlFor="companySize">Company Size *</label>
                  <select
                    id="companySize"
                    value={data.companySize || ""}
                    onChange={(e) =>
                    updateData({ companySize: e.target.value })
                    }
                    aria-invalid={!!errors.companySize}>

                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {errors.companySize &&
                  <span className={styles.error}>{errors.companySize}</span>
                  }
                </div>

                <div className={styles.field}>
                  <label htmlFor="industry">Industry *</label>
                  <select
                    id="industry"
                    value={data.industry || ""}
                    onChange={(e) => updateData({ industry: e.target.value })}
                    aria-invalid={!!errors.industry}>

                    <option value="">Select industry</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.industry &&
                  <span className={styles.error}>{errors.industry}</span>
                  }
                </div>
              </div>);


          case 2:
            return (
              <div className={styles.fields}>
                <div className={styles.checkboxField}>
                  <label>
                    <input
                      type="checkbox"
                      checked={data.notifications || false}
                      onChange={(e) =>
                      updateData({ notifications: e.target.checked })
                      } />

                    <span>Email notifications</span>
                  </label>
                </div>

                <div className={styles.checkboxField}>
                  <label>
                    <input
                      type="checkbox"
                      checked={data.newsletter || false}
                      onChange={(e) =>
                      updateData({ newsletter: e.target.checked })
                      } />

                    <span>Monthly newsletter</span>
                  </label>
                </div>

                <div className={styles.field}>
                  <label htmlFor="theme">Theme Preference</label>
                  <select
                    id="theme"
                    value={data.theme || "light"}
                    onChange={(e) =>
                    updateData({ theme: e.target.value as "light" | "dark" })
                    }>

                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>);


          case 3:
            return (
              <div className={styles.review}>
                <h3>Personal Information</h3>
                <dl>
                  <dt>Name</dt>
                  <dd>
                    {data.firstName} {data.lastName}
                  </dd>
                  <dt>Email</dt>
                  <dd>{data.email}</dd>
                </dl>

                <h3>Company Details</h3>
                <dl>
                  <dt>Company</dt>
                  <dd>{data.companyName}</dd>
                  <dt>Size</dt>
                  <dd>{data.companySize}</dd>
                  <dt>Industry</dt>
                  <dd>{data.industry}</dd>
                </dl>

                <h3>Preferences</h3>
                <dl>
                  <dt>Email notifications</dt>
                  <dd>{data.notifications ? "Yes" : "No"}</dd>
                  <dt>Newsletter</dt>
                  <dd>{data.newsletter ? "Yes" : "No"}</dd>
                  <dt>Theme</dt>
                  <dd>{data.theme || "Light"}</dd>
                </dl>
              </div>);


          default:
            return null;
        }
      }}
    </MultiStepForm>);

};