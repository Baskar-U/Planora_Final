import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Search, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle,
  MapPin,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";
import ProgressIndicator, { EVENT_PLANNING_STEPS, updateStepStatus } from "./ProgressIndicator";

interface QuickStartGuideProps {
  className?: string;
  showProgress?: boolean;
}

const quickSteps = [
  {
    icon: Search,
    title: "Search for Services",
    description: "Find vendors, venues, and services in your area",
    action: "Browse Services",
    href: "/services",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    icon: Users,
    title: "Compare Vendors",
    description: "Read reviews and compare prices from verified vendors",
    action: "Find Vendors",
    href: "/vendors",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    icon: Calendar,
    title: "Book Your Event",
    description: "Reserve your chosen services and manage bookings",
    action: "Start Planning",
    href: "/post-order",
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    icon: Star,
    title: "Enjoy Your Event",
    description: "Relax and enjoy your perfectly planned event",
    action: "View Orders",
    href: "/my-orders",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  }
];

export default function QuickStartGuide({ className = "", showProgress = true }: QuickStartGuideProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(EVENT_PLANNING_STEPS);

  const handleStepClick = (stepId: string, href: string) => {
    // Check if the route requires authentication
    const protectedRoutes = ['/post-order', '/my-orders', '/profile', '/cart'];
    const isProtectedRoute = protectedRoutes.some(route => href.includes(route));
    
    if (isProtectedRoute) {
      // Redirect to login with return URL
      setLocation(`/?auth=login&return=${encodeURIComponent(href)}`);
      return;
    }
    
    const updatedSteps = updateStepStatus(steps, stepId);
    setSteps(updatedSteps);
    setCurrentStep(updatedSteps.findIndex(step => step.status === 'current') + 1);
    setLocation(href);
  };

  const handleActionClick = (href: string) => {
    // Check if the route requires authentication
    const protectedRoutes = ['/post-order', '/my-orders', '/profile', '/cart'];
    const isProtectedRoute = protectedRoutes.some(route => href.includes(route));
    
    if (isProtectedRoute) {
      // Redirect to login with return URL
      setLocation(`/?auth=login&return=${encodeURIComponent(href)}`);
      return;
    }
    
    setLocation(href);
  };

  return (
    <div className={`bg-gradient-to-br from-primary-50 to-blue-50 py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-semibold">🚀 Quick Start</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Plan your perfect event with our easy-to-follow process. 
            <span className="font-semibold text-primary-600"> No account required to start exploring!</span>
          </p>
        </div>

        {/* Progress Indicator */}
        {showProgress && (
          <div className="mb-8 animate-slide-up">
            <ProgressIndicator 
              steps={steps} 
              currentStep={currentStep}
              showDescriptions={true}
            />
          </div>
        )}

                                   {/* Quick Start Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 stagger-children">
           {quickSteps.map((step, index) => {
             const Icon = step.icon;
             return (
                               <Card 
                  key={index} 
                  className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer animate-scale-in border-2 hover:border-primary-200 bg-white/80 backdrop-blur-sm"
                  onClick={() => handleStepClick(step.title.toLowerCase().replace(' ', '-'), step.href)}
                >
                                   <CardHeader className="pb-4 relative">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">{index + 1}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                                   <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300 font-semibold text-sm sm:text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(step.href);
                      }}
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
               </Card>
             );
           })}
         </div>

        {/* Features Highlight */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Local Vendors
            </h3>
            <p className="text-gray-600">
              Find verified vendors in your area with real reviews and ratings
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quick Booking
            </h3>
            <p className="text-gray-600">
              Book services instantly with secure payment and instant confirmation
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quality Assured
            </h3>
            <p className="text-gray-600">
              All vendors are verified and quality-checked for your peace of mind
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Planning?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join thousands of users who have successfully planned their events with Planora
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="btn-primary tap-target"
                onClick={() => handleActionClick("/post-order")}
              >
                Start Planning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="tap-target"
                onClick={() => handleActionClick("/vendors")}
              >
                Browse Vendors
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
