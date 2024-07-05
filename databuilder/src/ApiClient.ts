import axios, {AxiosInstance} from 'axios';
import tough, {Cookie, CookieJar} from 'tough-cookie';

export interface HttpResponse<T> {
    success: boolean;
    data?: T | null;
    error?: string;
    started: number;
    ended: number;
}

export interface ListResponse {
    results: [];
    count: number;
    next?: string;
    previous?: string;
}

class ApiClient {
    private client: AxiosInstance;
    private cookieJar: CookieJar;

    constructor() {
        this.client = axios.create({
            withCredentials: true, // Ensures cookies are sent with requests
            httpsAgent: new (require('https').Agent)({rejectUnauthorized: false}), // Handle HTTPS requests
        });
        this.cookieJar = new tough.CookieJar();
    }

    public async login(email: string, password: string): Promise<HttpResponse<any>> {
        const HttpResponse: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
            started: new Date().getTime(),
            ended: 0,
        };

        const url = `${process.env.REACT_APP_API_HOST}/auth/login/`
        try {
            const response = await this.client.post(url, {
                email,
                password,
            });
            HttpResponse.ended = new Date().getTime();
            HttpResponse.data = response.data;
            HttpResponse.success = true;

            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                await this.setCookies(url, setCookieHeader);
            }

        } catch (error: any) {
            HttpResponse.ended = new Date().getTime();
            HttpResponse.data = error.response?.data?.detail
            if (!HttpResponse.data) {
                HttpResponse.data = (error as Error).message;
            }
            console.error('Login failed:', error.message);
        }

        return HttpResponse;
    }

    public async post<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        const HttpResponse: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
            started: new Date().getTime(),
            ended: 0,
        };

        try {
            // Merge headers with cookies
            const mergedHeaders = await this.getMergedHeaders(url, headers);

            const response = await this.client.post<T>(url, data, {
                headers: mergedHeaders,
            });
            HttpResponse.ended = new Date().getTime();
            HttpResponse.data = response.data;
            HttpResponse.success = true;
        } catch (error: any) {
            HttpResponse.data = error.response?.data?.detail
            if (!HttpResponse.data) {
                HttpResponse.data = (error as Error).message;
            }
            HttpResponse.ended = new Date().getTime();
            console.error('Post failed:', error.message);
        }

        return HttpResponse;
    }

    public async get<T>(url: string): Promise<HttpResponse<T>> {
        const HttpResponse: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
            started: new Date().getTime(),
            ended: 0,
        };

        try {
            const headers = await this.getCookieHeaders(url);
            const response = await this.client.get<T>(url, {headers});
            HttpResponse.ended = new Date().getTime();
            HttpResponse.data = response.data;
            HttpResponse.success = true;
        } catch (error: any) {
            HttpResponse.data = error.response?.data?.detail
            if (!HttpResponse.data) {
                HttpResponse.data = (error as Error).message;
            }
            HttpResponse.ended = new Date().getTime();
            console.error('Post failed:', error.message);
        }

        return HttpResponse;
    }

    private async getMergedHeaders(url: string, headers: any): Promise<any> {
        const cookieHeaders = await this.getCookieHeaders(url);
        return {
            ...headers,
            ...cookieHeaders,
        };
    }

    private async getCookieHeaders(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cookieJar.getCookies(url, (err, cookies) => {
                if (err) {
                    reject(err);
                } else {
                    const cookieHeader = cookies?.map((cookie) => `${cookie.key}=${cookie.value}`).join('; ');
                    resolve(cookieHeader ? {Cookie: cookieHeader} : {});
                }
            });
        });
    }

    private async setCookies(url: string, setCookieHeader: string[]): Promise<void> {
        setCookieHeader.forEach((cookieStr) => {
            const cookie = Cookie.parse(cookieStr);
            if (cookie) {
                this.cookieJar.setCookieSync(cookie, url);
            }
        });
    }
}

export default ApiClient;
