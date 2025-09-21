import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  className,
  text = "Loading Planora..."
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "animate-spin rounded-full border-4 border-gray-200",
          sizeClasses[size]
        )}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-500 border-b-primary-400"></div>
        </div>
        
        {/* Inner pulse */}
        <div className={cn(
          "absolute inset-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse",
          size === "sm" ? "inset-1" : size === "lg" ? "inset-3" : size === "xl" ? "inset-4" : "inset-2"
        )}></div>
        
        {/* Center dot */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          size === "sm" ? "inset-1" : size === "lg" ? "inset-3" : size === "xl" ? "inset-4" : "inset-2"
        )}>
          <div className={cn(
            "bg-white rounded-full",
            size === "sm" ? "w-1 h-1" : size === "lg" ? "w-2 h-2" : size === "xl" ? "w-3 h-3" : "w-1.5 h-1.5"
          )}></div>
        </div>
      </div>
      
      {text && (
        <div className={cn(
          "mt-4 text-center",
          textSizes[size]
        )}>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">{text}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
