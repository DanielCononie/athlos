import {
  createContext,
  PropsWithChildren,
  createElement,
  useContext,
  useMemo,
  useState,
} from "react";

import { AuthUser, loginUser, registerUser } from "@/features/auth/api";

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo(
    () => ({
      user,
      signIn: async (email: string, password: string) => {
        const authenticatedUser = await loginUser(email, password);
        setUser(authenticatedUser);
      },
      register: async (email: string, password: string) => {
        const registeredUser = await registerUser(email, password);
        setUser(registeredUser);
      },
      signOut: () => setUser(null),
    }),
    [user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
