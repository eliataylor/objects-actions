import axios, { AxiosInstance, AxiosResponse } from 'axios';
import tough, { CookieJar } from 'tough-cookie';
import { CookieJar as CookieJarSupport } from 'axios-cookiejar-support';
import https from 'https';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  started?: number;
  ended?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const cookieJar = new CookieJar(new tough.Store());
    const cookieJarSupport = new CookieJarSupport(cookieJar);

    this.client = axios.create({
      withCredentials: true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    this.client.defaults.jar = cookieJar;
    this.client.defaults.validateStatus = (status) => status < 500;

    this.client.interceptors.request.use(cookieJarSupport.interceptor);
    this.client.interceptors.response.use(cookieJarSupport.interceptor);
  }


  public async login(username: string, password: string): Promise<ApiResponse<any>> {
    const url = `${process.env.REACT_APP_API_HOST}/auth/login/`
    try {
      const response: AxiosResponse = await this.client.post(
        url,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status < 500, // Validate only client errors
          transformResponse: (data, headers) => {
            const setCookieHeader = headers['set-cookie'];
            if (setCookieHeader) {
              setCookieHeader.forEach((cookie: string) => {
                this.cookieJar.setCookieSync(cookie, url);
              });
            }
            return JSON.parse(data);
          },
        }
      );

      if (response.status !== 200) {
        return { success: false, error: `Login failed: ${response.statusText}` };
      }

      console.log('Login successful');
      const cookies = this.cookieJar.getCookiesSync(url);
      console.log('Cookies:', cookies);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Internal error occurred' };
    }
  }

  public async post(url: string, data: any): Promise<ApiResponse<any>> {
    try {
      const cookieString = this.cookieJar.getCookieStringSync(url);
      const response: AxiosResponse = await this.client.post(
        url,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieString,
          }
        }
      );

      if (response.status !== 200) {
        return { success: false, error: `POST request failed: ${response.statusText}` };
      }

      console.log('POST request successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('POST request failed:', error);
      return { success: false, error: 'Internal error occurred' };
    }
  }
}

export default ApiClient;
