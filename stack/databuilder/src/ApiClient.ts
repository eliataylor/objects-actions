import axios, {AxiosInstance} from 'axios';
import tough, {Cookie, CookieJar} from 'tough-cookie';
import {Users} from "./types";

export interface HttpResponse<T> {
    status: number;
    success: boolean;
    data: T | any;
    error?: string;
    errors?: { [key: string]: any };
    started: number;
    ended: number;
    cookie?: Cookie;
}

class ApiClient {
    private client: AxiosInstance;
    private cookieJar: CookieJar;

    constructor() {
        this.client = axios.create({
            withCredentials: true, // Ensures cookies are sent with requests
            baseURL: process.env.REACT_APP_API_HOST,
            headers: {
                'Referer': process.env.REACT_APP_APP_HOST,  // Adding Referer header to simulate request origin
                'Origin': process.env.REACT_APP_APP_HOST,    // Adding Origin header to simulate request origin
                "Content-Type": "application/json"
            },
            httpsAgent: new (require('https').Agent)({rejectUnauthorized: false}), // Handle HTTPS requests
        });
        this.cookieJar = new tough.CookieJar();

        // Interceptor to set CSRF token from cookies
        this.client.interceptors.request.use(async (config) => {
            const cookies = await this.cookieJar.getCookies(config.url || '');
            const csrfTokenCookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
            if (csrfTokenCookie) {
                config.headers['X-CSRFToken'] = csrfTokenCookie.value;
            }

            if (process.env.REACT_APP_USE_TOKEN) {
                config.headers['X-App-Client'] = "ios" // or android
                config.headers['Authorization'] = `Bearer ${process.env.REACT_APP_USE_TOKEN}`;
            }

            if (config.url) {
                if (config.url.indexOf("?") > -1) {
                    const parts = config.url.split("?");
                    if (parts[0].endsWith('/')) {
                        config.url = parts[0].slice(0, -1) + "?" + parts[1];
                    }
                } else {
                    if (config.url.endsWith('/')) {
                        config.url = config.url.slice(0, -1);
                    }
                }
            }

            return config;
        }, (error) => {
            return Promise.reject(error);
        });

    }

    public initResponse(): HttpResponse<any> {
        return {
            status: 200,
            success: false,
            data: null,
            error: undefined,
            started: new Date().getTime(),
            ended: 0
        };
    }

    public async login(email: string, password: string): Promise<HttpResponse<any>> {

        this.cookieJar.removeAllCookiesSync()

        let url = `${process.env.REACT_APP_API_HOST}/_allauth/browser/v1/config`
        const config = await this.client.get(url);
        const setCookieHeader = config.headers['set-cookie'];
        if (setCookieHeader) {
            await this.setCookies(url, setCookieHeader);
        }

        let resp = this.initResponse()

        url = `${process.env.REACT_APP_API_HOST}/_allauth/browser/v1/auth/login`
        try {
            const response = await this.post(url, {
                username: email,
                email,
                password,
            });
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;
            }

        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error('Login failed:', error.message);
        }

        const cookies = await this.cookieJar.getCookies(url || '');
        let cookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
        if (cookie) {
            resp.cookie = cookie
        }

        resp.ended = new Date().getTime();

        return resp;
    }

    public async register(baseData: Users): Promise<HttpResponse<any>> {

        this.cookieJar.removeAllCookiesSync()

        let url = `${process.env.REACT_APP_API_HOST}/_allauth/browser/v1/config`

        const config = await this.client.get(url);
        const setCookieHeader = config.headers['set-cookie'];
        if (setCookieHeader) {
            await this.setCookies(url, setCookieHeader);
        }

        let resp = this.initResponse()

        url = `${process.env.REACT_APP_API_HOST}/_allauth/browser/v1/auth/signup`
        try {
            const response = await this.post(url, baseData);
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;
            }

        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error('Login failed:', error.message);
        }

        const cookies = await this.cookieJar.getCookies(url || '');
        let cookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
        if (cookie) {
            resp.cookie = cookie
        }

        resp.ended = new Date().getTime();

        return resp;
    }

    public async post<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        let resp = this.initResponse()
        let response = null;
        const eid = url.split('/').pop()
        let method = parseInt(eid || '') > 1 ? 'patch' : 'post';

        try {
            // Merge headers with cookies
            const mergedHeaders = await this.getMergedHeaders(url, headers);

            // @ts-ignore
            response = await this.client[method](url, data,
                {headers: mergedHeaders}
            );
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;

                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    // TODO: change if changes!?!
                    await this.setCookies(url, setCookieHeader);
                }
            }

        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error(`${method} failed:`, resp.data);
        }
        resp.ended = new Date().getTime();

        return resp;
    }

    public async get<T>(url: string): Promise<HttpResponse<T>> {
        let resp = this.initResponse()

        try {
            const headers = await this.getCookieHeaders(url);
            const response = await this.client.get<T>(url, {headers});
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;
            }
        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error('Post failed:', error.message);
        }
        resp.ended = new Date().getTime();

        return resp;
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

    public returnErrors(error: any): HttpResponse<any> {
        let resp = this.initResponse()

        if (!error) return resp;
        if (typeof error === 'string') return resp;

        let found = undefined;
        if (axios.isAxiosError(error) && error.response) {
            error = error.response.data;
        } else if (axios.isAxiosError(error)) {
            error = error.message;
        }

        if (error.error) {
            found = error.error
        } else if (error.detail) {
            found = error.detail
        } else if (error) {
            found = error
        }
        if (found && typeof found === 'object') {
            resp.errors = found
            found = Object.entries(found).map(([key, err]) => {
                if (typeof err === 'string') return `${key}: ${err}`
                return `${key}: ${Array.isArray(err) ? err.join(', ') : err}`
            })
            found = found.join("\n\r ");
        }

        resp.error = found
        resp.ended = new Date().getTime();

        return resp;
    }

    getCookies() {
        return this.cookieJar.getSetCookieStringsSync(process.env.REACT_APP_API_HOST || "*");
    }

    public async setCookie(url: string, cookie: string)  {
        return this.cookieJar.setCookieSync(cookie, url);
    }

    public setCookies(url: string, setCookieHeader: string[]) {
        setCookieHeader.forEach((cookieStr) => {
            const cookie = Cookie.parse(cookieStr);
            if (cookie) {
                this.cookieJar.setCookieSync(cookie, url);
            }
        });
    }
}

export default ApiClient;
