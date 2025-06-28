import { createContext, useState, useContext } from 'react';

// Create our theme context using createContext()
export const ThemeContext = createContext();

// Create a custom hook that allows easy access to our ThemeContext values
// without this useContext, whenever children components want to call a function
// that changes the state of the context, that child copoment will not see the changes
// and will not re-render.
// so we need to use the useContext hook to subscribe to the context value.
export const useTheme = () => useContext(ThemeContext);

// Creating our theme provider. Accepts an argument of "props", here we plucking off the "children" object.
export default function ThemeProvider({ children }) {
  // Creating our state
  const [darkTheme, setDarkTheme] = useState(true);

  // Method to update our state
  const toggleTheme = () => {
    console.log('inside toggle theme');
    // setDarkTheme is a function that updates the state of darkTheme
    // (prev) => !prev means if darkTheme is true, set it to false, and vice versa
    return setDarkTheme((prev) => !prev);
  };

  // The provider component will wrap all other components inside of it that need access to our global state
  return (
    // Dark theme and toggle theme are getting provided to the child components
    <ThemeContext.Provider value={{ darkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
