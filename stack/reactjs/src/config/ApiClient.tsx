import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { getCSRFToken } from '../allauth/lib/django';

export interface HttpResponse<T = any> {
  success: boolean;
  data?: T | null;
  error?: string;
  errors?: { [key: string]: any };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_HOST,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => this.requestInterceptor(config),
      (error) => Promise.reject(error)
    );
  }

  private requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add CSRF token
    const csrfToken = getCSRFToken();
    const allheaders = config.headers;
    if (csrfToken) {
      allheaders['X-CSRFToken'] = csrfToken
    }

    // Add mobile app headers if available
    const appOS = localStorage.getItem('appOS');
    const token = localStorage.getItem('oaexample_token');
    if (appOS && token) {
      allheaders['X-App-Client'] = appOS
      allheaders['Authorization'] = `Bearer ${token}`
    }

    config.headers = allheaders

    // Clean up URL trailing slashes
    if (config.url) {
      config.url = this.normalizeUrl(config.url);
    }

    return config;
  }

  private normalizeUrl(url: string): string {
    const [path, query] = url.split('?');
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    return query ? `${cleanPath}?${query}` : cleanPath;
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    headers: any = {}
  ): Promise<HttpResponse<T>> {
    try {
      const config: AxiosRequestConfig = { headers };
      const response: AxiosResponse<T> = await (method === 'get' || method === 'delete'
        ? this.client[method]<T>(url, config)
        : this.client[method]<T>(url, data, config));

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): HttpResponse<any> {
    if (!error) {
      return { success: false, error: 'Unknown error occurred' };
    }

    let errorData = error;
    if (axios.isAxiosError(error)) {
      errorData = error.response?.data ?? error.message;
    }

    const errorMessage = this.extractErrorMessage(errorData);
    const errorResponse: HttpResponse<any> = {
      success: false,
      error: errorMessage
    };

    if (typeof errorData === 'object') {
      errorResponse.errors = errorData;
    }

    return errorResponse;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;

    const errorSource = error.error || error.detail || error;
    if (typeof errorSource === 'object') {
      return Object.entries(errorSource)
        .map(([key, err]) => {
          const errorValue = Array.isArray(err) ? err.join(', ') : err;
          return `${key}: ${errorValue}`;
        })
        .join('\n\r ');
    }

    return String(errorSource);
  }

  // Public API methods
  public async get<T>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>('get', url);
  }

  public async post<T>(url: string, data: any, headers?: any): Promise<HttpResponse<T>> {
    return this.request<T>('post', url, data, headers);
  }

  public async put<T>(url: string, data: any, headers?: any): Promise<HttpResponse<T>> {
    return this.request<T>('put', url, data, headers);
  }

  public async patch<T>(url: string, data: any, headers?: any): Promise<HttpResponse<T>> {
    return this.request<T>('patch', url, data, headers);
  }

  public async delete<T>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>('delete', url);
  }
}

export default new ApiClient();
