import * as React from "react";
import { cn } from "@/lib/utils";

const Loading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size],
        )}
      />
    </div>
  );
});
Loading.displayName = "Loading";

const LoadingDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-1 justify-center items-center", className)}
    {...props}
  >
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
  </div>
));
LoadingDots.displayName = "LoadingDots";

export { Loading, LoadingDots };
