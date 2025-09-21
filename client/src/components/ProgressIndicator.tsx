import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
  showDescriptions?: boolean;
}

export default function ProgressIndicator({ 
  steps, 
  currentStep, 
  className = "",
  showDescriptions = false 
}: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isUpcoming = step.status === 'upcoming';
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-110",
                    isCompleted && "bg-primary-600 border-primary-600 text-white shadow-lg",
                    isCurrent && "bg-white border-primary-600 text-primary-600 shadow-md ring-2 ring-primary-200",
                    isUpcoming && "bg-gray-100 border-gray-300 text-gray-400 hover:border-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 animate-pulse" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Step Title */}
                <div className="mt-3 text-center max-w-28">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isCompleted && "text-primary-600 font-semibold",
                      isCurrent && "text-primary-600 font-semibold",
                      isUpcoming && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  
                  {/* Step Description */}
                  {showDescriptions && step.description && (
                    <p
                      className={cn(
                        "text-xs mt-1 transition-colors duration-200 leading-tight",
                        isCompleted && "text-primary-500",
                        isCurrent && "text-primary-500",
                        isUpcoming && "text-gray-400"
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-3">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out rounded-full",
                      isCompleted ? "bg-primary-600" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
          }}
        />
      </div>
      
      {/* Enhanced Current Step Info */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
          <p className="text-sm font-medium text-primary-700">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <p className="text-xl font-bold text-gray-900 mt-3">
          {steps[currentStep - 1]?.title}
        </p>
        {steps[currentStep - 1]?.description && (
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            {steps[currentStep - 1].description}
          </p>
        )}
      </div>
    </div>
  );
}

// Hook for managing progress
export function useProgress(steps: ProgressStep[]) {
  const getCurrentStep = () => {
    return steps.findIndex(step => step.status === 'current') + 1;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStep() - 1;
    return ((currentIndex) / (steps.length - 1)) * 100;
  };

  const isCompleted = () => {
    return steps.every(step => step.status === 'completed');
  };

  const canProceed = () => {
    const currentIndex = getCurrentStep() - 1;
    return currentIndex < steps.length - 1;
  };

  return {
    getCurrentStep,
    getProgressPercentage,
    isCompleted,
    canProceed,
  };
}

// Predefined event planning steps
export const EVENT_PLANNING_STEPS: ProgressStep[] = [
  {
    id: 'create-event',
    title: 'Create Event',
    description: 'Set up your event details',
    status: 'upcoming'
  },
  {
    id: 'add-details',
    title: 'Add Details',
    description: 'Specify requirements and preferences',
    status: 'upcoming'
  },
  {
    id: 'find-vendors',
    title: 'Find Vendors',
    description: 'Browse and compare services',
    status: 'upcoming'
  },
  {
    id: 'book-services',
    title: 'Book Services',
    description: 'Reserve your chosen vendors',
    status: 'upcoming'
  },
  {
    id: 'confirm',
    title: 'Confirm',
    description: 'Review and finalize your event',
    status: 'upcoming'
  }
];

// Helper function to update step status
export function updateStepStatus(
  steps: ProgressStep[], 
  currentStepId: string
): ProgressStep[] {
  return steps.map(step => {
    if (step.id === currentStepId) {
      return { ...step, status: 'current' as const };
    } else if (steps.findIndex(s => s.id === step.id) < steps.findIndex(s => s.id === currentStepId)) {
      return { ...step, status: 'completed' as const };
    } else {
      return { ...step, status: 'upcoming' as const };
    }
  });
}
