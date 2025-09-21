import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { onAuthStateChange } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn, UserPlus } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Required
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please sign in to access this page
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full btn-primary"
              onClick={() => setLocation("/?auth=login")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/?auth=signup")}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
