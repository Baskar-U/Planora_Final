import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLoading } from '@/contexts/LoadingContext';

const useNavigationLoading = () => {
  const [location] = useLocation();
  const { setIsLoading, setLoadingMessage } = useLoading();

  useEffect(() => {
    console.log('Navigation loading triggered for location:', location);
    
    // Show loading when location changes
    setIsLoading(true);
    setLoadingMessage('Loading Planora...');

    // Hide loading after 2 seconds to ensure smooth transition
    const timer = setTimeout(() => {
      console.log('Hiding loading after 2 seconds');
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [location, setIsLoading, setLoadingMessage]);
};

export { useNavigationLoading };
