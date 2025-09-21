import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseService, Application, ApplicationPhase } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { useUserType } from '@/contexts/UserTypeContext';
import { 
  Search, 
  ShoppingCart, 
  CheckCircle, 
  CreditCard, 
  Award,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface FloatingOrderTrackerProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const phaseConfig = {
  browsing_vendors: {
    label: "Browsing",
    icon: Search,
    color: "bg-blue-500",
    shortDescription: "Exploring vendors"
  },
  order_initiated: {
    label: "Initiated",
    icon: ShoppingCart,
    color: "bg-orange-500",
    shortDescription: "Order sent to vendors"
  },
  order_confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "bg-green-500",
    shortDescription: "Vendor confirmed"
  },
  payment_done: {
    label: "Paid",
    icon: CreditCard,
    color: "bg-purple-500",
    shortDescription: "Payment completed"
  },
  order_completed: {
    label: "Completed",
    icon: Award,
    color: "bg-emerald-600",
    shortDescription: "Event completed"
  }
};

const phaseOrder: ApplicationPhase[] = [
  'browsing_vendors',
  'order_initiated', 
  'order_confirmed',
  'payment_done',
  'order_completed'
];

export default function FloatingOrderTracker({ 
  position = 'bottom-right',
  className = ""
}: FloatingOrderTrackerProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const { userType } = useUserType();

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch user's applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['userApplications', currentUser?.uid],
    queryFn: () => firebaseService.getApplicationsByUser(currentUser?.uid || ''),
    enabled: !!currentUser?.uid,
  });

  // Find the most recent active application
  useEffect(() => {
    if (applications.length > 0) {
      const activeApp = applications.find(app => 
        app.status !== 'cancelled' && app.status !== 'refunded'
      );
      setActiveApplication(activeApp || applications[0]);
    }
  }, [applications]);

  // Don't show tracker for vendors, only for customers
  if (userType === 'vendor' || !currentUser || isLoading || !activeApplication) {
    return null;
  }

  const currentPhaseIndex = phaseOrder.indexOf(activeApplication.phase);
  const progressPercentage = ((currentPhaseIndex + 1) / phaseOrder.length) * 100;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border max-w-sm">
        {/* Minimized State */}
        {isMinimized ? (
          <div 
            className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsMinimized(false)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phaseConfig[activeApplication.phase].color}`}>
                {React.createElement(phaseConfig[activeApplication.phase].icon, { 
                  className: "w-4 h-4 text-white" 
                })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {phaseConfig[activeApplication.phase].label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Order #{activeApplication.orderId.slice(-8)}
                </p>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ) : (
          /* Expanded State */
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phaseConfig[activeApplication.phase].color}`}>
                  {React.createElement(phaseConfig[activeApplication.phase].icon, { 
                    className: "w-4 h-4 text-white" 
                  })}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {phaseConfig[activeApplication.phase].label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {phaseConfig[activeApplication.phase].shortDescription}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${phaseConfig[activeApplication.phase].color}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Info */}
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Event:</span> {activeApplication.eventType}</p>
              <p><span className="font-medium">Date:</span> {new Date(activeApplication.eventDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Vendor:</span> {activeApplication.vendorName}</p>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Phase Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-900">Order Progress</h4>
                  <div className="space-y-1">
                    {phaseOrder.map((phase, index) => {
                      const isCompleted = index <= currentPhaseIndex;
                      const isCurrent = index === currentPhaseIndex;
                      const config = phaseConfig[phase];
                      
                      return (
                        <div key={phase} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? config.color 
                              : 'bg-gray-200'
                          }`}>
                            {isCompleted && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`text-xs ${
                            isCurrent 
                              ? 'font-medium text-gray-900' 
                              : isCompleted 
                                ? 'text-gray-700' 
                                : 'text-gray-400'
                          }`}>
                            {config.label}
                          </div>
                          {isCurrent && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Updates */}
                {activeApplication.timeline && activeApplication.timeline.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-900">Recent Updates</h4>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {activeApplication.timeline.slice(-2).reverse().map((event) => (
                        <div key={event.id} className="flex items-start space-x-2 text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-700 line-clamp-2">{event.description}</p>
                            <p className="text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-2 rounded hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 px-2 rounded hover:bg-gray-200 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
