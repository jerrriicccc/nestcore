const TOKEN_KEY = "token";
const RBAC_PREFIX = "RBAC-";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") {
      console.error("Token payload does not contain a valid 'exp' claim.", payload);
      return true;
    }
    const expirationTime = payload.exp * 1000; // exp is in seconds, convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error decoding token or checking expiry:", error);
    return true; // Assume expired if decoding fails
  }
};

export const getToken = (): string | null => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  // Check if token has expired by decoding the JWT
  if (isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return token;
};

export const setToken = (token: string, rbacTokens?: { [key: string]: string }, expiresIn: string = "24h"): void => {
  // Store only the token - expiry will be checked from the JWT itself
  sessionStorage.setItem(TOKEN_KEY, token);

  // Store RBAC tokens for each module
  if (rbacTokens) {
    Object.entries(rbacTokens).forEach(([module, rbacToken]) => {
      sessionStorage.setItem(`${RBAC_PREFIX}${module}`, rbacToken);
    });
  }
};

export const clearToken = (): void => {
  sessionStorage.clear();
};

export const getRBACToken = (module: string): string | null => {
  const token = sessionStorage.getItem(`${RBAC_PREFIX}${module}`);
  return token;
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id || payload.sub,
      email: payload.email,
      defaultroleid: payload.defaultroleid,
    };
  } catch (error) {
    console.error("Error decoding user data from token:", error);
    return null;
  }
};

// Auto-clear tokens when tab/window is closed
export const setupTokenCleanup = () => {
  window.addEventListener("beforeunload", () => {
    clearToken();
  });
};
