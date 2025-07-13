import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./modal-dialog.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "small" | "medium" | "large" | "fullscreen";
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;
  role?: "dialog" | "alertdialog";
  className?: string;
}

/**
 * Accessible Modal Dialog Pattern
 *
 * Features:
 * - Focus trapping
 * - Escape key handling
 * - Click outside to close
 * - Scroll locking
 * - Smooth animations
 * - Multiple sizes
 * - Custom footer
 * - Screen reader announcements
 * - Return focus on close
 * - Prevents background interaction
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "medium",
  closeOnEscape = true,
  closeOnClickOutside = true,
  showCloseButton = true,
  footer,
  children,
  initialFocus,
  returnFocus = true,
  role = "dialog",
  className = ""
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);

  // Store the element that had focus before modal opened
  useEffect(() => {
    if (isOpen && !mounted.current) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      mounted.current = true;
    } else if (!isOpen && mounted.current) {
      mounted.current = false;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        // Find first focusable element
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const focusTimeout = setTimeout(setInitialFocus, 50);

    return () => clearTimeout(focusTimeout);
  }, [isOpen, initialFocus]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && returnFocus && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen, returnFocus]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    modalElement.addEventListener("keydown", handleTabKey);
    return () => modalElement.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnClickOutside && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnClickOutside, onClose]
  );

  if (!isOpen) return null;

  const modalContent =
  <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
      ref={modalRef}
      role={role}
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
      className={`${styles.modal} ${styles[`modal-${size}`]} ${className}`}>

        {/* Header */}
        {(title || showCloseButton) &&
      <div className={styles.header}>
            {title &&
        <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
        }
            {showCloseButton &&
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close modal">

                <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">

                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
        }
          </div>
      }

        {/* Description */}
        {description &&
      <p id="modal-description" className={styles.description}>
            {description}
          </p>
      }

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>;


  // Render into portal
  return createPortal(modalContent, document.body);
};

// Confirm Dialog Pattern
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info"
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
      role="alertdialog"
      initialFocus={confirmButtonRef}
      footer={
      <div className={styles.confirmFooter}>
          <button
          type="button"
          onClick={onCancel}
          className={`${styles.button} ${styles.buttonSecondary}`}>

            {cancelText}
          </button>
          <button
          ref={confirmButtonRef}
          type="button"
          onClick={onConfirm}
          className={`${styles.button} ${styles.buttonPrimary} ${styles[`button-${variant}`]}`}>

            {confirmText}
          </button>
        </div>
      }>

      <p className={styles.confirmMessage}>{message}</p>
    </Modal>);

};

// Drawer Pattern (slides from side)
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: "left" | "right";
  width?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = "right",
  width = "400px",
  children
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Similar focus management and keyboard handling as Modal
  // ... (implement similar patterns)

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${styles[`drawer-${position}`]}`}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}>

        {title &&
        <div className={styles.drawerHeader}>
            <h2 id="drawer-title" className={styles.drawerTitle}>
              {title}
            </h2>
            <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close drawer">

              ×
            </button>
          </div>
        }
        <div className={styles.drawerContent}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

// Example usage
export const ModalExamples: React.FC = () => {
  const [showBasic, setShowBasic] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShowBasic(true)}>Open Basic Modal</button>
      <button onClick={() => setShowConfirm(true)}>Open Confirm Dialog</button>
      <button onClick={() => setShowForm(true)}>Open Form Modal</button>

      {/* Basic Modal */}
      <Modal
        isOpen={showBasic}
        onClose={() => setShowBasic(false)}
        title="Basic Modal"
        description="This is a basic modal with all accessibility features.">

        <p>Modal content goes here. Press Escape to close.</p>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={() => {
          logger.info("Confirmed!");
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        title="Delete Item?"
        message="This action cannot be undone. Are you sure you want to delete this item?"
        confirmText="Delete"
        variant="danger" />


      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Edit Profile"
        size="medium"
        footer={
        <div className={styles.formFooter}>
            <button
            type="button"
            onClick={() => setShowForm(false)}
            className={`${styles.button} ${styles.buttonSecondary}`}>

              Cancel
            </button>
            <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}>

              Save Changes
            </button>
          </div>
        }>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            logger.info("Form submitted");
            setShowForm(false);
          }}>

          <div className={styles.formField}>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" required />
          </div>
          <div className={styles.formField}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required />
          </div>
        </form>
      </Modal>
    </div>);

};