import {
  createContext,
  PropsWithChildren,
  createElement,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  AuthApiError,
  AuthUser,
  apiFetch,
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from "@/features/auth/api";
import { deleteStoredToken, getStoredToken, storeToken } from "@/features/auth/tokenStorage";

type AuthContextValue = {
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedToken = await getStoredToken();

        if (!storedToken) {
          return;
        }

        const authenticatedUser = await getAuthenticatedUser(storedToken);

        if (isMounted) {
          setToken(storedToken);
          setUser(authenticatedUser);
        }
      } catch {
        await deleteStoredToken();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      authenticatedFetch: async (path: string, init?: RequestInit) => {
        if (!token) {
          throw new AuthApiError("You must be signed in to make this request.", 401);
        }

        const response = await apiFetch(path, token, init);

        if (response.status === 401) {
          await deleteStoredToken();
          setToken(null);
          setUser(null);
        }

        return response;
      },
      isLoading,
      token,
      user,
      signIn: async (email: string, password: string) => {
        const auth = await loginUser(email, password);
        await storeToken(auth.token);
        setToken(auth.token);
        setUser(auth.user);
      },
      register: async (email: string, password: string) => {
        const auth = await registerUser(email, password);
        await storeToken(auth.token);
        setToken(auth.token);
        setUser(auth.user);
      },
      signOut: async () => {
        await deleteStoredToken();
        setToken(null);
        setUser(null);
      },
    }),
    [isLoading, token, user],
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
