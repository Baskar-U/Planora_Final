import React, { createContext, useContext, useState } from 'react';

interface RedirectContextType {
  redirectUrl: string | null;
  setRedirectUrl: (url: string | null) => void;
  clearRedirectUrl: () => void;
}

const RedirectContext = createContext<RedirectContextType | undefined>(undefined);

export function RedirectProvider({ children }: { children: React.ReactNode }) {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const clearRedirectUrl = () => {
    setRedirectUrl(null);
  };

  return (
    <RedirectContext.Provider value={{ redirectUrl, setRedirectUrl, clearRedirectUrl }}>
      {children}
    </RedirectContext.Provider>
  );
}

export function useRedirect() {
  const context = useContext(RedirectContext);
  if (context === undefined) {
    throw new Error('useRedirect must be used within a RedirectProvider');
  }
  return context;
}





