'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface VisibilityContextType {
  showFinancialValues: boolean;
  autoHideOnStart: boolean;
  toggleVisibility: () => void;
  setAutoHideOnStart: (val: boolean) => void;
  isMounted: boolean;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export function VisibilityProvider({ children }: { children: React.ReactNode }) {
  const [showFinancialValues, setShowFinancialValues] = useState(true);
  const [autoHideOnStart, setAutoHideOnStart] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Run only on client
    const savedVisibility = localStorage.getItem('findomus.preferences.visibility');
    const savedAutoHide = localStorage.getItem('findomus.preferences.autoHide') === 'true';

    setAutoHideOnStart(savedAutoHide);
    
    if (savedAutoHide) {
      setShowFinancialValues(false);
    } else if (savedVisibility !== null) {
      setShowFinancialValues(savedVisibility !== 'hidden');
    } else {
      setShowFinancialValues(true);
    }

    setIsMounted(true);
  }, []);

  const toggleVisibility = () => {
    setShowFinancialValues((prev) => {
      const newValue = !prev;
      localStorage.setItem('findomus.preferences.visibility', newValue ? 'show' : 'hidden');
      return newValue;
    });
  };

  const handleSetAutoHideOnStart = (val: boolean) => {
    setAutoHideOnStart(val);
    localStorage.setItem('findomus.preferences.autoHide', val ? 'true' : 'false');
  };

  return (
    <VisibilityContext.Provider
      value={{
        showFinancialValues: isMounted ? showFinancialValues : false, // Evita flash de conteúdo durante hidratação
        autoHideOnStart,
        toggleVisibility,
        setAutoHideOnStart: handleSetAutoHideOnStart,
        isMounted,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility deve ser usado dentro de um VisibilityProvider');
  }
  return context;
}
