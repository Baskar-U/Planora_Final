import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseService, Application, ApplicationPhase, ApplicationStatus } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';

export function useOrderTracking() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch user's applications
  const { 
    data: applications = [], 
    isLoading: applicationsLoading,
    error: applicationsError 
  } = useQuery({
    queryKey: ['userApplications', currentUser?.uid],
    queryFn: () => firebaseService.getApplicationsByUser(currentUser?.uid || ''),
    enabled: !!currentUser?.uid,
  });

  // Get active application (most recent non-cancelled/refunded)
  const activeApplication = applications.find(app => 
    app.status !== 'cancelled' && app.status !== 'refunded'
  ) || applications[0] || null;

  // Create new application mutation
  const createApplicationMutation = useMutation({
    mutationFn: (applicationData: Omit<Application, 'id'>) => 
      firebaseService.createApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications', currentUser?.uid] });
    },
  });

  // Update application phase mutation
  const updatePhaseMutation = useMutation({
    mutationFn: ({ 
      applicationId, 
      phase, 
      status, 
      description, 
      updatedBy, 
      metadata 
    }: {
      applicationId: string;
      phase: ApplicationPhase;
      status: ApplicationStatus;
      description: string;
      updatedBy: 'customer' | 'vendor' | 'admin' | 'system';
      metadata?: any;
    }) => firebaseService.updateApplicationPhase(
      applicationId, 
      phase, 
      status, 
      description, 
      updatedBy, 
      metadata
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications', currentUser?.uid] });
    },
  });

  // Update application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, updates }: { 
      applicationId: string; 
      updates: Partial<Application> 
    }) => firebaseService.updateApplication(applicationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications', currentUser?.uid] });
    },
  });

  // Helper function to create a new application
  const createApplication = async (applicationData: Omit<Application, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const newApplication = {
      ...applicationData,
      userId: currentUser.uid,
      timeline: [{
        id: Date.now().toString(),
        phase: 'browsing_vendors' as ApplicationPhase,
        timestamp: new Date().toISOString(),
        description: 'Application created - browsing vendors',
        updatedBy: 'customer' as const,
        metadata: {}
      }]
    };

    return createApplicationMutation.mutateAsync(newApplication);
  };

  // Helper function to update application phase
  const updateApplicationPhase = async (
    applicationId: string,
    phase: ApplicationPhase,
    status: ApplicationStatus,
    description: string,
    updatedBy: 'customer' | 'vendor' | 'admin' | 'system' = 'customer',
    metadata?: any
  ) => {
    return updatePhaseMutation.mutateAsync({
      applicationId,
      phase,
      status,
      description,
      updatedBy,
      metadata
    });
  };

  // Helper function to update application
  const updateApplication = async (
    applicationId: string,
    updates: Partial<Application>
  ) => {
    return updateApplicationMutation.mutateAsync({
      applicationId,
      updates
    });
  };

  // Helper function to get phase progress
  const getPhaseProgress = (phase: ApplicationPhase) => {
    const phaseOrder: ApplicationPhase[] = [
      'browsing_vendors',
      'order_initiated', 
      'order_confirmed',
      'payment_done',
      'order_completed'
    ];
    
    const currentIndex = phaseOrder.indexOf(phase);
    return {
      currentPhase: phase,
      currentIndex,
      totalPhases: phaseOrder.length,
      progressPercentage: ((currentIndex + 1) / phaseOrder.length) * 100,
      nextPhase: currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null,
      previousPhase: currentIndex > 0 ? phaseOrder[currentIndex - 1] : null
    };
  };

  return {
    // Data
    applications,
    activeApplication,
    currentUser,
    
    // Loading states
    applicationsLoading,
    isCreating: createApplicationMutation.isPending,
    isUpdatingPhase: updatePhaseMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    
    // Error states
    applicationsError,
    createError: createApplicationMutation.error,
    updatePhaseError: updatePhaseMutation.error,
    updateError: updateApplicationMutation.error,
    
    // Actions
    createApplication,
    updateApplicationPhase,
    updateApplication,
    
    // Helpers
    getPhaseProgress,
    
    // Refetch
    refetchApplications: () => queryClient.invalidateQueries({ 
      queryKey: ['userApplications', currentUser?.uid] 
    })
  };
}








