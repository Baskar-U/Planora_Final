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
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Calendar,
  User
} from 'lucide-react';

interface OrderPhaseTrackerProps {
  className?: string;
  showDetails?: boolean;
}

const phaseConfig = {
  browsing_vendors: {
    label: "Browsing Vendors",
    icon: Search,
    color: "bg-blue-500",
    description: "Exploring available vendors for your event"
  },
  order_initiated: {
    label: "Order Initiated",
    icon: ShoppingCart,
    color: "bg-orange-500",
    description: "Your order has been initiated and sent to vendors"
  },
  order_confirmed: {
    label: "Order Confirmed",
    icon: CheckCircle,
    color: "bg-green-500",
    description: "Vendor has confirmed your order"
  },
  payment_done: {
    label: "Payment Done",
    icon: CreditCard,
    color: "bg-purple-500",
    description: "Payment has been successfully processed"
  },
  order_completed: {
    label: "Order Completed",
    icon: Award,
    color: "bg-emerald-600",
    description: "Your event has been completed successfully"
  }
};

const phaseOrder: ApplicationPhase[] = [
  'browsing_vendors',
  'order_initiated', 
  'order_confirmed',
  'payment_done',
  'order_completed'
];

export default function OrderPhaseTracker({ className = "", showDetails = false }: OrderPhaseTrackerProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
  if (userType === 'vendor' || !currentUser || isLoading) {
    return null;
  }

  if (!activeApplication) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">No Active Orders</h3>
              <p className="text-sm text-gray-500">Start browsing vendors to begin your event planning journey</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPhaseIndex = phaseOrder.indexOf(activeApplication.phase);
  const progressPercentage = ((currentPhaseIndex + 1) / phaseOrder.length) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phaseConfig[activeApplication.phase].color}`}>
              {React.createElement(phaseConfig[activeApplication.phase].icon, { 
                className: "w-4 h-4 text-white" 
              })}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {phaseConfig[activeApplication.phase].label}
              </h3>
              <p className="text-sm text-gray-500">
                {phaseConfig[activeApplication.phase].description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Order #{activeApplication.orderId.slice(-8)}
              </p>
              <p className="text-xs text-gray-500">
                {activeApplication.eventType}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
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
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t px-4 py-3 space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Event Date:</span>
              <span className="font-medium">{new Date(activeApplication.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{activeApplication.eventLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Vendor:</span>
              <span className="font-medium">{activeApplication.vendorName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Guests:</span>
              <span className="font-medium">{activeApplication.guestCount}</span>
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Order Progress</h4>
            <div className="space-y-2">
              {phaseOrder.map((phase, index) => {
                const isCompleted = index <= currentPhaseIndex;
                const isCurrent = index === currentPhaseIndex;
                const config = phaseConfig[phase];
                
                return (
                  <div key={phase} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? config.color 
                        : 'bg-gray-200'
                    }`}>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`text-sm ${
                      isCurrent 
                        ? 'font-medium text-gray-900' 
                        : isCompleted 
                          ? 'text-gray-700' 
                          : 'text-gray-400'
                    }`}>
                      {config.label}
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Updates */}
          {activeApplication.timeline && activeApplication.timeline.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Recent Updates</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeApplication.timeline.slice(-3).reverse().map((event) => (
                  <div key={event.id} className="flex items-start space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700">{event.description}</p>
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
            <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
              View Details
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
              Contact Vendor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
