import { env } from "~/env";

const DJANGO_API_BASE = env.NEXT_PUBLIC_API_HOST;
const ALLAUTH_BASE = `${DJANGO_API_BASE}/_allauth/browser/v1`;

export interface DjangoAuthResponse {
  status: number;
  data?: any;
  meta?: {
    is_authenticated?: boolean;
    session_token?: string;
  };
  message?: string;
}

export interface ProviderTokenData {
  provider: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

export class DjangoAuthClient {
  private sessionToken?: string;

  constructor(sessionToken?: string) {
    this.sessionToken = sessionToken;
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<DjangoAuthResponse> {
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.sessionToken) {
      defaultHeaders['X-Session-Token'] = this.sessionToken;
    }

    if (data) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
      credentials: 'include',
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${ALLAUTH_BASE}${endpoint}`, requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Django API request failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate with Django using OAuth provider token
   */
  async authenticateWithProviderToken(
    providerTokenData: ProviderTokenData,
    process: 'login' | 'connect' = 'login'
  ): Promise<DjangoAuthResponse> {
    return this.makeRequest('/auth/provider/token', 'POST', {
      provider: providerTokenData.provider,
      token: providerTokenData,
      process
    });
  }

  /**
   * Get current authentication status
   */
  async getAuth(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/auth/session');
  }

  /**
   * Get Django configuration
   */
  async getConfig(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/config');
  }

  /**
   * Logout from Django
   */
  async logout(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/auth/session', 'DELETE');
  }

  /**
   * Get user's social account providers
   */
  async getProviders(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/account/providers');
  }

  /**
   * Connect a new social provider to existing account
   */
  async connectProvider(
    providerTokenData: ProviderTokenData
  ): Promise<DjangoAuthResponse> {
    return this.authenticateWithProviderToken(providerTokenData, 'connect');
  }

  /**
   * Disconnect a social provider from account
   */
  async disconnectProvider(
    providerId: string,
    accountUid: string
  ): Promise<DjangoAuthResponse> {
    return this.makeRequest('/account/providers', 'DELETE', {
      provider: providerId,
      account: accountUid
    });
  }

  /**
   * Get user's email addresses
   */
  async getEmails(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/account/email');
  }

  /**
   * Get user's sessions
   */
  async getSessions(): Promise<DjangoAuthResponse> {
    return this.makeRequest('/auth/sessions');
  }

  /**
   * Update session token
   */
  updateSessionToken(token: string) {
    this.sessionToken = token;
  }

  /**
   * Get current session token
   */
  getSessionToken() {
    return this.sessionToken;
  }
}

/**
 * Create a new Django auth client instance
 */
export function createDjangoAuthClient(sessionToken?: string) {
  return new DjangoAuthClient(sessionToken);
}

/**
 * Utility function to check if Django backend is reachable
 */
export async function checkDjangoHealth(): Promise<boolean> {
  try {
    const client = new DjangoAuthClient();
    const response = await client.getConfig();
    return response.status === 200;
  } catch (error) {
    console.error('Django health check failed:', error);
    return false;
  }
}

/**
 * Map NextAuth provider names to Django allauth provider names
 */
export function mapProviderName(nextAuthProvider: string): string {
  const mapping: Record<string, string> = {
    'google': 'google',
    'github': 'github',
    'spotify': 'spotify',
    'linkedin': 'linkedin',
    'discord': 'discord', // You might need to add Discord to Django allauth
    'openid_connect': 'openid_connect',
  };

  return mapping[nextAuthProvider] || nextAuthProvider;
} 