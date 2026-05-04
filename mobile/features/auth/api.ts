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
  token: string;
  user: AuthUser;
};

type MeResponse = {
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
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string) {
  const data = (await response.json().catch(() => null)) as (T & ApiErrorResponse) | null;

  if (!response.ok) {
    const message = data?.message ?? fallbackMessage;
    throw new AuthApiError(message, response.status);
  }

  if (!data) {
    throw new AuthApiError("The server returned an unexpected response.", response.status);
  }

  return data as T;
}

export async function apiFetch(path: string, token: string, init: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new AuthApiError("Could not reach the server. Check that the API is running.");
  }

  return response;
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

  const data = await parseJsonResponse<AuthResponse>(
    response,
    "Authentication failed. Please try again.",
  );

  if (!data.token || !data.user) {
    throw new AuthApiError("The server returned an unexpected response.");
  }

  return data;
}

export function loginUser(email: string, password: string) {
  return postAuth("/login", email, password);
}

export function registerUser(email: string, password: string) {
  return postAuth("/register", email, password);
}

export async function getAuthenticatedUser(token: string) {
  const response = await apiFetch("/me", token);
  const data = await parseJsonResponse<MeResponse>(response, "Your session has expired.");

  if (!data.user) {
    throw new AuthApiError("The server returned an unexpected response.", response.status);
  }

  return data.user;
}
