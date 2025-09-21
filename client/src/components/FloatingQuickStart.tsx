import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  X, 
  ArrowRight,
  Search,
  Users,
  Calendar,
  Star
} from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingQuickStart() {
  const [, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      icon: Search,
      title: "Browse Services",
      description: "Find vendors and services",
      href: "/services",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Find Vendors",
      description: "Compare verified vendors",
      href: "/vendors",
      color: "bg-green-500"
    },
    {
      icon: Calendar,
      title: "Start Planning",
      description: "Begin your event planning",
      href: "/post-order",
      color: "bg-purple-500"
    }
  ];

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
    setIsExpanded(false);
  };

  return (
    <>
      {/* Floating Quick Start Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full shadow-lg transition-all duration-300 ${
            isExpanded ? 'bg-primary-600' : 'bg-primary-600 hover:bg-primary-700'
          }`}
          size="lg"
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Rocket className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Expanded Quick Start Panel */}
      {isExpanded && (
        <div className="fixed bottom-20 right-6 z-50 w-80">
          <Card className="shadow-2xl border-2 border-primary-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900">Quick Start</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  No Login Required
                </Badge>
              </div>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.href)}
                      className="w-full p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Trusted by 10,000+ users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}


