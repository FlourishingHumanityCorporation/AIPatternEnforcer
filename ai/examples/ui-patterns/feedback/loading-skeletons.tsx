import React from "react";
import styles from "./loading-skeletons.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | "none";
  className?: string;
}

/**
 * Skeleton Loading Pattern
 *
 * Features:
 * - Multiple variants (text, circular, rectangular)
 * - Smooth animations
 * - Accessible loading states
 * - Matches actual content dimensions
 * - Respects prefers-reduced-motion
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1em",
  variant = "text",
  animation = "pulse",
  className = "",
}) => {
  const getHeight = () => {
    if (variant === "text") return height;
    if (variant === "circular") return width; // Circular is square
    return height;
  };

  return (
    <span
      className={`
        ${styles.skeleton}
        ${styles[`skeleton-${variant}`]}
        ${styles[`skeleton-${animation}`]}
        ${className}
      `}
      style={{
        width,
        height: getHeight(),
      }}
      role="status"
      aria-label="Loading..."
    >
      <span className={styles.srOnly}>Loading...</span>
    </span>
  );
};

// Card Skeleton Pattern
interface CardSkeletonProps {
  showAvatar?: boolean;
  lines?: number;
  showActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showAvatar = true,
  lines = 3,
  showActions = true,
}) => {
  return (
    <div
      className={styles.cardSkeleton}
      role="status"
      aria-label="Loading card..."
    >
      <div className={styles.cardHeader}>
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <div className={styles.cardHeaderText}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>

      <div className={styles.cardContent}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? "80%" : "100%"}
            height={16}
            className={styles.textLine}
          />
        ))}
      </div>

      {showActions && (
        <div className={styles.cardActions}>
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
      )}
    </div>
  );
};

// Table Skeleton Pattern
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}) => {
  return (
    <div
      className={styles.tableSkeleton}
      role="status"
      aria-label="Loading table..."
    >
      <table className={styles.table}>
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index}>
                  <Skeleton width="80%" height={20} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton
                    width={colIndex === 0 ? "60%" : "90%"}
                    height={16}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// List Skeleton Pattern
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showSecondaryText?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 3,
  showAvatar = true,
  showSecondaryText = true,
}) => {
  return (
    <ul
      className={styles.listSkeleton}
      role="status"
      aria-label="Loading list..."
    >
      {Array.from({ length: items }).map((_, index) => (
        <li key={index} className={styles.listItem}>
          {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
          <div className={styles.listItemContent}>
            <Skeleton width="70%" height={20} />
            {showSecondaryText && (
              <Skeleton
                width="50%"
                height={16}
                className={styles.secondaryText}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

// Content Placeholder Pattern
interface ContentPlaceholderProps {
  animation?: "pulse" | "wave" | "none";
  children: React.ReactNode;
}

export const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({
  animation = "pulse",
  children,
}) => {
  return (
    <div
      className={`${styles.placeholder} ${styles[`placeholder-${animation}`]}`}
    >
      {children}
    </div>
  );
};

// Smart Loading State Hook
interface UseLoadingStateProps<T> {
  data?: T;
  isLoading: boolean;
  error?: Error | null;
  skeleton: React.ReactNode;
  empty?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export function useLoadingState<T>({
  data,
  isLoading,
  error,
  skeleton,
  empty,
  errorComponent,
}: UseLoadingStateProps<T>) {
  if (isLoading) return skeleton;
  if (error) return errorComponent || <div>Error: {error.message}</div>;
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return empty || <div>No data available</div>;
  }
  return null; // Render actual content
}

// Example Usage
export const SkeletonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.examples}>
      <h2>Loading States</h2>

      <section>
        <h3>Card Loading</h3>
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <img src="/avatar.jpg" alt="User" />
              <div>
                <h4>John Doe</h4>
                <p>Software Engineer</p>
              </div>
            </div>
            <div className={styles.cardContent}>
              <p>This is the actual content that appears after loading.</p>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3>Table Loading</h3>
        {isLoading ? (
          <TableSkeleton rows={3} columns={4} />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td>Admin</td>
                <td>Active</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3>Custom Content with Placeholder</h3>
        {isLoading ? (
          <ContentPlaceholder animation="wave">
            <div className={styles.customLayout}>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <div className={styles.customContent}>
                <Skeleton width="80%" height={24} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="60%" height={16} />
              </div>
            </div>
          </ContentPlaceholder>
        ) : (
          <div className={styles.customLayout}>
            <img src="/hero.jpg" alt="Hero" />
            <div className={styles.customContent}>
              <h3>Article Title</h3>
              <p>Article content goes here...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// CSS Module Example (loading-skeletons.module.css)
/*
.skeleton {
  display: inline-block;
  background-color: var(--skeleton-base, #e0e0e0);
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-circular {
  border-radius: 50%;
}

.skeleton-rectangular {
  border-radius: 0;
}

.skeleton-rounded {
  border-radius: 8px;
}

.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-wave {
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #e0e0e0) 25%,
    var(--skeleton-highlight, #f0f0f0) 50%,
    var(--skeleton-base, #e0e0e0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s linear infinite;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse,
  .skeleton-wave {
    animation: none;
  }
  
  .skeleton-pulse {
    opacity: 0.8;
  }
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cardSkeleton {
  padding: 16px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  background: var(--background, #fff);
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cardHeaderText {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cardContent {
  margin-bottom: 16px;
}

.textLine:not(:last-child) {
  margin-bottom: 8px;
}

.cardActions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.tableSkeleton {
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.listSkeleton {
  list-style: none;
  padding: 0;
  margin: 0;
}

.listItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.listItem:last-child {
  border-bottom: none;
}

.listItemContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.secondaryText {
  margin-top: 4px;
}

.placeholder {
  position: relative;
}

.placeholder-pulse > * {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.placeholder-wave::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 75%
  );
  animation: skeleton-wave 1.5s linear infinite;
  pointer-events: none;
}

.examples {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.examples section {
  margin-bottom: 40px;
}

.card,
.customLayout {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/
