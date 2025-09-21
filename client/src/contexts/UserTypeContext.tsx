import React, { createContext, useContext, useState, useEffect } from 'react';

type UserType = 'customer' | 'vendor';

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export function UserTypeProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType>('customer');

  // Load user type from localStorage on mount
  useEffect(() => {
    const savedUserType = localStorage.getItem('userType') as UserType;
    if (savedUserType && (savedUserType === 'customer' || savedUserType === 'vendor')) {
      setUserType(savedUserType);
    }
  }, []);

  // Save user type to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);

  const toggleUserType = () => {
    console.log('🔄 UserTypeContext: Toggling user type from', userType);
    setUserType(prev => {
      const newType = prev === 'customer' ? 'vendor' : 'customer';
      console.log('🔄 UserTypeContext: New user type will be', newType);
      return newType;
    });
  };

  return (
    <UserTypeContext.Provider value={{ userType, setUserType, toggleUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
}

export function useUserType() {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
}
