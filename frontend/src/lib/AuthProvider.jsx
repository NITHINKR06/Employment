"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "./firebaseClient";
import { signOutUser } from "./authClient";
import { apiFetch } from "./apiClient";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const body = await apiFetch("/auth/me");
            if (body.success && body.data?.user) {
              setUser(body.data.user);
            }
          } catch (err) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    } catch (err) {
      setIsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
