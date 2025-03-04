// context/BackendContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BackendContext = createContext();

export const useBackend = () => {
  return useContext(BackendContext);
};

export const BackendProvider = ({ children }) => {
  const [backendUrl, setBackendUrl] = useState(null);

  useEffect(() => {
    const loadURL = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem('BackendUrl');
        if (storedUrl) {
          setBackendUrl(storedUrl);
        } else {
          console.log('No Backend URL found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching backend URL:', error);
      }
    };
    loadURL();
  }, []);

  return (
    <BackendContext.Provider value={{ backendUrl, setBackendUrl }}>
      {children}
    </BackendContext.Provider>
  );
};
