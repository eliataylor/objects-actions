import axios, {AxiosInstance} from 'axios';
import tough, {Cookie, CookieJar, MemoryCookieStore} from 'tough-cookie';
import {Users} from "./types";
import https from 'https';

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
    private COOKIE_DOMAIN: string;

    constructor() {
        const urlParts = new URL(process.env.REACT_APP_API_HOST!);

        this.COOKIE_DOMAIN = process.env.REACT_APP_API_HOST!; //  new URL(process.env.REACT_APP_API_HOST || 'http://localhost').hostname
        const store = new MemoryCookieStore();
        this.cookieJar = new tough.CookieJar(store, {
                allowSpecialUseDomain: true,
                looseMode: true,
                rejectPublicSuffixes: false
            }
        );

        this.client = axios.create({
            withCredentials: true, // Ensures cookies are sent with requests
            baseURL: process.env.REACT_APP_API_HOST,
            headers: {
                'Referer': process.env.REACT_APP_APP_HOST,  // Adding Referer header to simulate request origin
                'Origin': process.env.REACT_APP_APP_HOST,    // Adding Origin header to simulate request origin
                'Host': urlParts.host,
                "Content-Type": "application/json"
            },
            httpsAgent: new (https.Agent)({rejectUnauthorized: false}), // Handle HTTPS requests
        });

        // Interceptor to set CSRF token from cookies
        this.client.interceptors.request.use(async (config) => {
            const cookies = await this.cookieJar.getCookies(this.makeAbsoluteUrl(config.url));
            const csrfTokenCookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
            if (csrfTokenCookie) {
                config.headers['X-CSRFToken'] = csrfTokenCookie.value;
            }

            const cookieHeader = cookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
            if (cookieHeader) {
                config.headers['Cookie'] = cookieHeader;
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

        this.client.interceptors.response.use(
            async (response) => {
                // Check if the response has the 'set-cookie' header
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    this.setCookies(setCookieHeader, this.makeAbsoluteUrl(response.config.url));
                }
                return response; // Return the response as-is for further processing
            },
            (error) => {
                // Handle errors
                return Promise.reject(error);
            }
        );
    }

    makeAbsoluteUrl(url?: string): string {
        if (!url) return this.COOKIE_DOMAIN;
        if (url.startsWith('/')) return `${process.env.REACT_APP_API_HOST}${url}`;
        return url;
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

        let url = `/_allauth/browser/v1/config`
        await this.client.get(url); // sets cookie

        url = `/_allauth/browser/v1/auth/login`
        const payload: any = {password}
        if (email.indexOf("@") > -1) {
            payload.email = email;
        } else {
            payload.username = email;
        }

        const resp = await this.post(url, payload);

        const cookies = await this.cookieJar.getCookies(this.makeAbsoluteUrl(url));
        let cookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
        if (cookie) {
            resp.cookie = cookie
        }

        return resp;
    }

    public async register(baseData: Users): Promise<HttpResponse<any>> {

        this.cookieJar.removeAllCookiesSync()

        let url = `/_allauth/browser/v1/config`
        await this.client.get(url); // sets cookie

        url = `/_allauth/browser/v1/auth/signup`
        const resp = await this.post(url, baseData);

        const cookies = await this.cookieJar.getCookies(this.makeAbsoluteUrl(url));
        let cookie = cookies.find(cookie => cookie.key === process.env.REACT_APP_CSRF_COOKIE_NAME);
        if (cookie) {
            resp.cookie = cookie
        }

        return resp;
    }

    public async post<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        let resp = this.initResponse()
        let response = null;
        const eid = url.split('/').pop()
        let method = parseInt(eid || '') > 1 ? 'PATCH' : 'POST';

        try {

            // @ts-ignore
            response = await this.client.request({
                url,
                method,
                data,
                headers
            });
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.status = response.status;
                resp.success = true;
            }

        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error(`${method} failed: ${url}`, resp.data);
        }
        resp.ended = new Date().getTime();

        return resp;
    }

    public async get<T>(url: string): Promise<HttpResponse<T>> {
        let resp = this.initResponse()

        try {
            const response = await this.client.get<T>(url);
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;
            }
        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error(`Get failed: ${url}`, error.message);
        }
        resp.ended = new Date().getTime();

        return resp;
    }

    public async delete<T>(url: string): Promise<HttpResponse<T>> {
        let resp = this.initResponse()

        try {
            const response = await this.client.delete<T>(url);
            if (response.status < 200 || response.status > 299) {
                resp = this.returnErrors(response.data)
                resp.status = response.status;
            } else {
                resp.data = response.data;
                resp.success = true;
            }
        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error(`Delete failed: ${url}`, error.message);
        }
        resp.ended = new Date().getTime();

        return resp;
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
            if (found.errors) {
                found = error.errors
            }
            resp.errors = found
            if (Array.isArray(found)) {
                found = found.map((err: any) => typeof err === 'object' ? JSON.stringify(err) : err)
            } else {
                found = Object.entries(found).map(([key, err]) => {
                    if (typeof err === 'string') return `${key}: ${err}`
                    return `${key}: ${Array.isArray(err) ? err.join(', ') : err}`
                })
            }
            found = found.join("\n\r ");
        }

        resp.error = found
        resp.ended = new Date().getTime();

        return resp;
    }

    public setCookies(setCookieHeader: string[], url: string) {
        setCookieHeader.forEach((cookieStr) => {
            const cookie = Cookie.parse(cookieStr);
            if (cookie) {
                this.cookieJar.setCookieSync(cookie, url, {
                    http: true,
                    secure: false,
                    ignoreError: true
                });
            }
        });
    }
}

export default ApiClient;
