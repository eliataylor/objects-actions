const isBrowser = typeof window !== 'undefined';

export function getCookie(name: string): string | null {
  if (!isBrowser || typeof document === 'undefined') return null;
  
  const cookieString = document.cookie;
  if (!cookieString) return null;
  
  let cookieValue: string | null = null;
  const cookies = cookieString.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === name + "=") {
      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
      break;
    }
  }
  return cookieValue;
}

export function getCSRFToken(): string | null {
  // Try both environment variable names for compatibility
  const cookieName = process.env.REACT_APP_CSRF_COOKIE_NAME || process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME;
  return cookieName ? getCookie(cookieName) : null;
}

export function getAuthToken(): string | null {
  if (!isBrowser || typeof window === 'undefined') return null;
  return window.localStorage?.getItem("oaexample_token") || null;
}

export function getAppOS(): string | null {
  if (!isBrowser || typeof window === 'undefined') return null;
  return window.localStorage?.getItem("appOS") || null;
}

/**
 * Get authentication headers for tRPC requests
 * Works for both client and server contexts
 */
export function getAuthHeaders(existingHeaders?: Headers): Headers {
  const headers = existingHeaders || new Headers();
  
  // Add CSRF token (client-side only, as server doesn't have cookies)
  if (isBrowser) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }

    // Add mobile app headers if available
    const appOS = getAppOS();
    const token = getAuthToken();
    
    if (appOS && token) {
      headers.set("X-App-Client", appOS);
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

/**
 * Get authentication headers for server-side requests
 * Uses headers from the request context
 */
export function getServerAuthHeaders(requestHeaders: Headers): Headers {
  const headers = new Headers();
  
  // Forward authentication headers from the incoming request
  const authorization = requestHeaders.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const csrfToken = requestHeaders.get("x-csrftoken");
  if (csrfToken) {
    headers.set("X-CSRFToken", csrfToken);
  }

  const appClient = requestHeaders.get("x-app-client");
  if (appClient) {
    headers.set("X-App-Client", appClient);
  }

  // Also forward cookies for CSRF token extraction
  const cookie = requestHeaders.get("cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return headers;
} 