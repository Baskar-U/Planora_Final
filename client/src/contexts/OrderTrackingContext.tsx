import React, { createContext, useContext, ReactNode } from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Application, ApplicationPhase, ApplicationStatus } from '@/lib/firebaseService';

interface OrderTrackingContextType {
  // Data
  applications: Application[];
  activeApplication: Application | null;
  currentUser: any;
  
  // Loading states
  applicationsLoading: boolean;
  isCreating: boolean;
  isUpdatingPhase: boolean;
  isUpdating: boolean;
  
  // Error states
  applicationsError: any;
  createError: any;
  updatePhaseError: any;
  updateError: any;
  
  // Actions
  createApplication: (applicationData: Omit<Application, 'id'>) => Promise<Application>;
  updateApplicationPhase: (
    applicationId: string,
    phase: ApplicationPhase,
    status: ApplicationStatus,
    description: string,
    updatedBy?: 'customer' | 'vendor' | 'admin' | 'system',
    metadata?: any
  ) => Promise<void>;
  updateApplication: (applicationId: string, updates: Partial<Application>) => Promise<void>;
  
  // Helpers
  getPhaseProgress: (phase: ApplicationPhase) => {
    currentPhase: ApplicationPhase;
    currentIndex: number;
    totalPhases: number;
    progressPercentage: number;
    nextPhase: ApplicationPhase | null;
    previousPhase: ApplicationPhase | null;
  };
  
  // Refetch
  refetchApplications: () => void;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

interface OrderTrackingProviderProps {
  children: ReactNode;
}

export function OrderTrackingProvider({ children }: OrderTrackingProviderProps) {
  const orderTracking = useOrderTracking();

  return (
    <OrderTrackingContext.Provider value={orderTracking}>
      {children}
    </OrderTrackingContext.Provider>
  );
}

export function useOrderTrackingContext() {
  const context = useContext(OrderTrackingContext);
  if (context === undefined) {
    throw new Error('useOrderTrackingContext must be used within an OrderTrackingProvider');
  }
  return context;
}








