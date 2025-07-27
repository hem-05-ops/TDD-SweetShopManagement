import { User } from "@shared/schema";

// Type for Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthStore {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage(); // Load token/user from localStorage on startup
  }

  // Load token and user from localStorage
  private loadFromStorage() {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("auth_user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.state = {
          user,
          token,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("Invalid user data in localStorage");
        this.clearAuth(); // fallback in case of error
      }
    }
  }

  // Save to localStorage
  private saveToStorage() {
    if (this.state.token && this.state.user) {
      localStorage.setItem("auth_token", this.state.token);
      localStorage.setItem("auth_user", JSON.stringify(this.state.user));
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }

  // Notify subscribers
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to state changes
 subscribe(listener: () => void): () => void {
  this.listeners.add(listener);
  return () => {
    this.listeners.delete(listener); // ✅ now it just performs cleanup without returning boolean
  };
}


  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Set auth state and save to storage
  setAuth(user: User, token: string) {
    this.state = {
      user,
      token,
      isAuthenticated: true,
    };
    this.saveToStorage();
    this.notify();
  }

  // Clear auth and localStorage
  clearAuth() {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    this.saveToStorage();
    this.notify();
  }

  // Get Authorization header
  getAuthHeader(): string | null {
    return this.state.token ? `Bearer ${this.state.token}` : null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.state.user?.role === "admin";
  }
}


// Export singleton
export const authStore = new AuthStore();

// Hook for React components to use auth state
import { useState, useEffect } from "react";

export function useAuth() {
  const [state, setState] = useState(authStore.getState());

  useEffect(() => {
  const unsubscribe = authStore.subscribe(() => {
    setState(authStore.getState());
  });

  return () => {
    unsubscribe(); // ✅ Call it inside another function
  };
}, []);

  return state;
}
