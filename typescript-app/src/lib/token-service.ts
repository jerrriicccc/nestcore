import { useCallback } from "react";

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

export const getToken = (): string | null => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token has expired
  if (Date.now() > parseInt(expiry)) {
    clearToken();
    return null;
  }

  return token;
};

export const setToken = (token: string, expiresIn: string = "24h"): void => {
  // Calculate expiry time
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours default

  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

export const clearToken = (): void => {
  sessionStorage.clear();
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Auto-clear tokens when tab/window is closed
export const setupTokenCleanup = () => {
  window.addEventListener("beforeunload", () => {
    clearToken();
  });
};
