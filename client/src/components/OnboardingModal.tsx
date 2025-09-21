import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Users, Calendar, MapPin, Star } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'customer' | 'vendor';
}

const customerSteps = [
  {
    id: 1,
    title: "Welcome to Planora!",
    description: "Your perfect event planning journey starts here. Let's get you set up in just a few steps.",
    icon: Sparkles,
    content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Plan Your Dream Event</h3>
        <p className="text-gray-600">
          Discover the best vendors, venues, and services for your special occasions. 
          From weddings to corporate events, we've got you covered.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "Find Your Perfect Vendors",
    description: "Browse through our curated list of verified vendors and services.",
    icon: Users,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Verified Vendors</h4>
            <p className="text-xs text-gray-600">Quality assured</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Easy Booking</h4>
            <p className="text-xs text-gray-600">Simple process</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Reviews & Ratings</h4>
            <p className="text-xs text-gray-600">Make informed decisions</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Search & Compare",
    description: "Use our powerful search to find exactly what you need.",
    icon: MapPin,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How to search:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              Choose your service type (catering, venue, etc.)
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              Select your preferred location
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              Compare prices and reviews
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
              Book your preferred vendor
            </li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "You're All Set!",
    description: "Ready to start planning your perfect event?",
    icon: CheckCircle,
    content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Let's Get Started!</h3>
        <p className="text-gray-600">
          You're now ready to explore vendors, compare services, and plan your perfect event. 
          Need help? Our support team is always here for you.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Users className="w-3 h-3 mr-1" />
            Browse Vendors
          </Badge>
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Calendar className="w-3 h-3 mr-1" />
            Book Services
          </Badge>
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Star className="w-3 h-3 mr-1" />
            Read Reviews
          </Badge>
        </div>
      </div>
    )
  }
];

const vendorSteps = [
  {
    id: 1,
    title: "Welcome to Planora!",
    description: "Join our community of trusted vendors and grow your business.",
    icon: Sparkles,
    content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Grow Your Business</h3>
        <p className="text-gray-600">
          Connect with customers looking for your services. 
          Manage bookings, showcase your work, and build your reputation.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "Showcase Your Services",
    description: "Create compelling service listings that attract customers.",
    icon: Users,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Reach More Customers</h4>
            <p className="text-xs text-gray-600">Expand your client base</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Manage Bookings</h4>
            <p className="text-xs text-gray-600">Easy scheduling</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Manage Your Profile",
    description: "Set up your vendor profile to attract the right customers.",
    icon: MapPin,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Profile setup checklist:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Add your business information
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Upload high-quality photos
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Set your service areas
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Define your pricing
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "You're Ready!",
    description: "Start receiving booking requests from customers.",
    icon: CheckCircle,
    content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Welcome to the Community!</h3>
        <p className="text-gray-600">
          Your vendor profile is ready. Start receiving booking requests and growing your business with Planora.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Users className="w-3 h-3 mr-1" />
            View Requests
          </Badge>
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Calendar className="w-3 h-3 mr-1" />
            Manage Bookings
          </Badge>
          <Badge variant="secondary" className="bg-primary-50 text-primary-700">
            <Star className="w-3 h-3 mr-1" />
            Build Reviews
          </Badge>
        </div>
      </div>
    )
  }
];

export default function OnboardingModal({ open, onOpenChange, userType }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = userType === 'customer' ? customerSteps : vendorSteps;
  const totalSteps = steps.length;

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Getting Started with Planora</span>
            <Badge variant="outline" className="text-xs">
              Step {currentStep} of {totalSteps}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step content */}
          <div className="min-h-[300px] flex items-center justify-center">
            {currentStepData?.content}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="tap-target"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </Button>
            </div>

            <Button
              onClick={handleNext}
              className="btn-primary tap-target"
            >
              {currentStep === totalSteps ? (
                <>
                  Get Started
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-primary-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${step.id}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
