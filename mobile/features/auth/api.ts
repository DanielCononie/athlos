import Constants from "expo-constants";
import { Platform } from "react-native";

export type AuthUser = {
  id: number;
  email: string;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  message: string;
  user: AuthUser;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const defaultApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

const configuredApiUrl = Constants.expoConfig?.extra?.apiUrl;

export const API_BASE_URL =
  typeof configuredApiUrl === "string" && configuredApiUrl.length > 0
    ? configuredApiUrl
    : defaultApiUrl;

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function postAuth(path: "/login" | "/register", email: string, password: string) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthApiError("Could not reach the server. Check that the API is running.");
  }

  const data = (await response.json().catch(() => null)) as AuthResponse | ApiErrorResponse | null;

  if (!response.ok) {
    const message =
      data && "message" in data && data.message
        ? data.message
        : "Authentication failed. Please try again.";

    throw new AuthApiError(message);
  }

  if (!data || !("user" in data)) {
    throw new AuthApiError("The server returned an unexpected response.");
  }

  return data.user;
}

export function loginUser(email: string, password: string) {
  return postAuth("/login", email, password);
}

export function registerUser(email: string, password: string) {
  return postAuth("/register", email, password);
}
