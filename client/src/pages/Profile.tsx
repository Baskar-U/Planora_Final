import { useState, useEffect } from "react";
import { useUserType } from "@/contexts/UserTypeContext";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";
import LoadingSpinner from "@/components/LoadingSpinner";
import CustomerProfile from "./CustomerProfile";
import VendorProfilePage from "./VendorProfilePage";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userType } = useUserType();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
          <p className="text-gray-600">Please sign in to access your profile settings.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate profile based on user type
  if (userType === 'vendor') {
    return <VendorProfilePage />;
  } else {
    return <CustomerProfile />;
  }
}
