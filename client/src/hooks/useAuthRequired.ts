import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { onAuthStateChange } from '@/lib/firebase';
import { useRedirect } from '@/contexts/RedirectContext';

export function useAuthRequired() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { setRedirectUrl } = useRedirect();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const requireAuth = (action: () => void, redirectPath?: string) => {
    if (loading) {
      console.log('🔄 useAuthRequired: Still loading auth state...');
      return;
    }

    if (!user) {
      console.log('🔒 useAuthRequired: User not authenticated, setting redirect and showing login');
      
      // Set the current path as redirect URL
      const currentPath = window.location.pathname;
      const finalRedirectPath = redirectPath || currentPath;
      
      console.log('🔄 useAuthRequired: Setting redirect URL to:', finalRedirectPath);
      setRedirectUrl(finalRedirectPath);
      
      // Navigate to home with auth modal
      setLocation('/?auth=login');
      return;
    }

    // User is authenticated, proceed with action
    console.log('✅ useAuthRequired: User authenticated, proceeding with action');
    action();
  };

  return {
    user,
    loading,
    requireAuth,
    isAuthenticated: !!user
  };
}





