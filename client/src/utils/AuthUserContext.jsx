import { useEffect } from "react";
import { createContext, useState, useContext } from "react";

export const AuthUserContext = createContext();
export const useAuthUser = () => useContext(AuthUserContext);

export const AuthUserProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('id_token');
        if (storedUser) {
            try {
                setAuthUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                setAuthUser(null);
                localStorage.removeItem('id_token');
                window.location.href = '/';
            }
        } else {
            setAuthUser(null);
            window.location.href = '/';
        }
    }, []);

  return (
    <AuthUserContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthUserContext.Provider>
  );
};
