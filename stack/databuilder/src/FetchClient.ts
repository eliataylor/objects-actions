import https from 'https';
import { URL } from 'url';
import { CookieJar } from 'tough-cookie';

interface FetchClient<T> {
  data: T;
  status: number;
  statusText: string;
}

export class FetchClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private cookieJar: CookieJar;

  constructor(defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = process.env.REACT_APP_API_HOST;
    this.defaultHeaders = defaultHeaders;
    this.cookieJar = new CookieJar();
  }

  private buildUrl(path: string): string {
    return new URL(path, this.baseUrl).toString();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<FetchClient<T>> {
    const url = this.buildUrl(path);
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    return new Promise((resolve, reject) => {
      const cookies = this.cookieJar.getCookieStringSync(url);
      if (cookies) {
        mergedHeaders['Cookie'] = cookies;
      }

      const options: https.RequestOptions = {
        method,
        headers: mergedHeaders,
      };

      const req = https.request(url, options, (res) => {
        const setCookieHeaders = res.headers['set-cookie'];
        if (setCookieHeaders) {
          setCookieHeaders.forEach((cookie) => this.cookieJar.setCookieSync(cookie, url));
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const response: FetchClient<T> = {
            data: null as unknown as T,
            status: res.statusCode || 0,
            statusText: res.statusMessage || '',
          };

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              response.data = JSON.parse(data);
              resolve(response);
            } catch (err) {
              response.data = data as unknown as T;
              resolve(response);
            }
          } else {
            reject({
              ...response,
              data,
            });
          }
        });
      });

      req.on('error', (err) => reject(err));

      if (body) {
        if (body instanceof FormData) {
          const boundary = (body as any)[Symbol.for('undici:formdata:boundary')];
          req.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
          body.pipe(req);
        } else {
          req.setHeader('Content-Type', 'application/json');
          req.write(JSON.stringify(body));
        }
      }

      req.end();
    });
  }

  public async get<T>(path: string, headers: Record<string, string> = {}): Promise<FetchClient<T>> {
    return this.request<T>('GET', path, undefined, headers);
  }

  public async post<T>(
    path: string,
    body: any,
    headers: Record<string, string> = {}
  ): Promise<FetchClient<T>> {
    return this.request<T>('POST', path, body, headers);
  }

  public async put<T>(
    path: string,
    body: any,
    headers: Record<string, string> = {}
  ): Promise<FetchClient<T>> {
    return this.request<T>('PUT', path, body, headers);
  }

  public async delete<T>(path: string, headers: Record<string, string> = {}): Promise<FetchClient<T>> {
    return this.request<T>('DELETE', path, undefined, headers);
  }

  // Interceptor Implementation
  public async withInterceptor<T>(
    method: () => Promise<FetchClient<T>>,
    onSuccess: (data: FetchClient<T>) => any,
    onError: (error: any) => any
  ): Promise<any> {
    try {
      const response = await method();
      return onSuccess(response);
    } catch (error) {
      return onError(error);
    }
  }
}

/* Usage example with interceptors
const client = new FetchClient('https://api.example.com', {
  Authorization: 'Bearer token',
});

(async () => {
  try {
    const data = await client.withInterceptor(
      () => client.get('/endpoint'),
      (response) => {
        console.log('Request succeeded:', response);
        return response;
      },
      (error) => {
        console.error('Request failed:', error);
        throw error;
      }
    );
  } catch (err) {
    console.error('Error handling request:', err);
  }
})();
 */
