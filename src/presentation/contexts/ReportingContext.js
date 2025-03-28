/**
 * ReportingContext.js
 * Context provider for reporting services
 */

import React, { createContext, useContext } from 'react';

// Create context
const ReportingContext = createContext(null);

// Custom hook to use the reporting context
export const useReporting = () => {
  const context = useContext(ReportingContext);
  if (!context) {
    throw new Error('useReporting must be used within a ReportingProvider');
  }
  return context;
};

// Provider component
export const ReportingProvider = ({ children, reportingService }) => {
  // Value to be provided by the context
  const value = {
    reportingService
  };

  return (
    <ReportingContext.Provider value={value}>
      {children}
    </ReportingContext.Provider>
  );
};