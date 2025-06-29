import { createContext, useState, useContext } from "react";

export const CustomThemeContext = createContext();

export const useCustomTheme = () => useContext(CustomThemeContext);

export default function CustomThemeProvider({ children }) {
  const [darkTheme, setDarkTheme] = useState(true);

  const toggleTheme = () => {
    console.log("inside toggle theme");
    setDarkTheme((prev) => !prev);
  };

  return (
    <CustomThemeContext.Provider value={{ darkTheme, toggleTheme }}>
      {children}
    </CustomThemeContext.Provider>
  );
}
