import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeDatabase } from '@/utils/database';

interface DatabaseContextType {
  isInitialized: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
});

export const useDatabase = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initialize();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized }}>
      {children}
    </DatabaseContext.Provider>
  );
};