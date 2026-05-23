import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

function getAuthState() {
  try {
    return localStorage.getItem("admin_token") === "admin-authenticated";
  } catch {
    return false;
  }
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthState);

  // Keep localStorage in sync across tabs
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(getAuthState());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem("admin_token", "admin-authenticated");
      setIsAuthenticated(true);
    } else {
      throw new Error("Invalid password");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    window.location.href = "/admin";
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
