import { createContext, useEffect, useState, useContext } from "react";
import { getStoredUser } from "../utils/session";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      try {
        const res = await fetch("/api/users/currentuser", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to verify session");
        }

        const payload = await res.json();
        const currentUser = payload?.currentUser || null;

        if (!cancelled) {
          setUser(currentUser);
          if (currentUser) {
            localStorage.setItem("user", JSON.stringify(currentUser));
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    syncSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = { user, login, logout, authReady };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
