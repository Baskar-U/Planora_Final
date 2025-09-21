import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeedbackToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: "text-green-600",
    progress: "bg-green-600",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-600",
    progress: "bg-red-600",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "text-blue-600",
    progress: "bg-blue-600",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "text-yellow-600",
    progress: "bg-yellow-600",
  },
};

export default function FeedbackToast({ message, onDismiss }: FeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const Icon = toastIcons[message.type];
  const styles = toastStyles[message.type];
  const duration = message.duration || 5000;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(message.id), 300);
  };

  const handleAction = () => {
    message.action?.onClick();
    handleDismiss();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        styles.container,
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
        <div
          className={cn("h-full transition-all duration-100 ease-linear", styles.progress)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start space-x-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", styles.icon)} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{message.title}</h4>
          {message.message && (
            <p className="text-sm mt-1 opacity-90">{message.message}</p>
          )}
          {message.action && (
            <button
              onClick={handleAction}
              className="mt-2 text-sm font-medium underline hover:no-underline transition-all tap-target"
            >
              {message.action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors tap-target"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast container component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export function ToastContainer({ toasts, onDismiss, position = 'top-right' }: ToastContainerProps) {
  return (
    <div className={cn("fixed z-50 space-y-2 max-w-sm w-full", positionStyles[position])}>
      {toasts.map((toast) => (
        <FeedbackToast
          key={toast.id}
          message={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const error = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'error', title, message, ...options });
  };

  const info = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    info,
    warning,
  };
}
