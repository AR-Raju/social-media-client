"use client";

import { authApi } from "@/services/api";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      console.log("Checking auth, token exists:", !!token);

      if (token) {
        const response = await authApi.getCurrentUser();
        console.log("Current user response:", response.data);

        // Handle different response structures
        const userData =
          response.data.user ||
          response.data.data?.user ||
          response.data.data ||
          response.data;

        if (userData && userData._id) {
          setUser(userData);
          console.log("User authenticated:", userData.name || userData.email);
        } else {
          console.log("Invalid user data received");
          localStorage.removeItem("auth_token");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login...");
      const response = await authApi.login({ email, password });
      console.log("Login response received:", response.data);

      // Handle different possible response structures
      let userData = null;
      let token = null;

      // Try different response structures
      if (response.data.user && response.data.accessToken) {
        userData = response.data.user;
        token = response.data.accessToken;
      } else if (response.data.data) {
        userData = response.data.data.user || response.data.data;
        token = response.data.data.accessToken || response.data.data.token;
      } else if (response.data.token) {
        userData = response.data.user || response.data;
        token = response.data.token;
      } else {
        // Fallback - assume the whole response.data is the user and look for token
        userData = response.data;
        token = response.data.accessToken || response.data.token;
      }

      console.log("Extracted user:", userData);
      console.log("Extracted token:", token ? "Token found" : "No token");

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      if (!userData || !userData._id) {
        throw new Error("Invalid user data received from server");
      }

      // Save token to localStorage first
      localStorage.setItem("auth_token", token);
      console.log("Token saved to localStorage");

      // Set user state
      setUser(userData);
      console.log("User state updated");

      // Set a cookie for middleware to read
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      console.log("Token saved to cookie");

      // Force a page reload to ensure middleware picks up the token
      console.log("Redirecting to home with page reload...");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      // Clean up any partial state
      localStorage.removeItem("auth_token");
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log("Attempting registration...");
      const response = await authApi.register(data);
      console.log("Registration response:", response.data);

      // Auto login after registration
      await login(data.email, data.password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("auth_token");
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
