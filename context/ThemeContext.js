import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState('light');

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setTema(colorScheme);
  }, []);

  const alternarTema = () => {
    setTema((tema) => (tema === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTema = () => useContext(ThemeContext);
