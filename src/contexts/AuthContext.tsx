import React, { createContext, useContext, useState, ReactNode } from "react";
import type { RestaurantData } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  restaurant: RestaurantData | null;
  login: (token: string, restaurant?: RestaurantData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(() => {
    const stored = localStorage.getItem("restaurant_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, restaurantData?: RestaurantData) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    if (restaurantData) {
      localStorage.setItem("restaurant_user", JSON.stringify(restaurantData));
      setRestaurant(restaurantData);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("restaurant_user");
    setToken(null);
    setRestaurant(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, restaurant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
