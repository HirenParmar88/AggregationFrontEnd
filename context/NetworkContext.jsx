import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Create a context for network status
export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isNetConnected, setIsNetConnected] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection Type:', state.type);
      setIsNetConnected(state.isConnected);
      console.log('Is connected:', state.isConnected);

      setIsVisible(true);
      if (state.isConnected) {
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isNetConnected, isVisible }}>
      {children}
    </NetworkContext.Provider>
  );
};
