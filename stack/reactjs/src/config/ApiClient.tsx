import axios, {AxiosInstance} from 'axios';
import {getCSRFToken} from "../allauth/lib/django";

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
            withCredentials: true, // Ensures cookies are sent with requests
        });

        // Interceptor to set CSRF token from cookies
        this.client.interceptors.request.use((config) => {
            const csrfToken = getCSRFToken();
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
            if (localStorage.getItem("appOS") && localStorage.getItem('_token')) {
                config.headers['X-App-Client'] = localStorage.getItem("appOS")
                config.headers['Authorization'] = `Bearer ${localStorage.getItem('_token')}`;
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


        /*
        this.client.interceptors.response.use(res => {
            if (res.data.apiversion) {
                var appversion = localStorage.getItem(Config.api.tokName + '_apiversion');
                if (appversion && parseInt(appversion) < parseInt(res.data.apiversion)) {
                    if (res.config.url.indexOf(Config.api.base + '/auth') === 0) { // on initial load and any form submissions that require menu updates
                        // localStorage.setItem(Config.api.tokName + '_apiversion', (res.data.apiversion) ? res.data.apiversion : Math.floor(new Date().getTime()/1000));
                    } else {
                        localStorage.setItem(Config.api.tokName + '_apiversion', res.data.apiversion);
                        localStorage.removeItem("cliptypes")// or else this will repeat every request
                        if (window.confirm("We've launched some breaking changes. Please reload this page to get the latest release.")) {
                            document.location.reload();
                        }
                    }
                }
            }
            return res;
        });
         */


    }

    public async post<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        let resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.post<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp = this.returnErrors(error)
        }

        return resp;
    }

    public async put<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        let resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.put<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp = this.returnErrors(error)
        }

        return resp;
    }

    public async patch<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        let resp: HttpResponse<T> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.patch<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp = this.returnErrors(error)
        }

        return resp;
    }

    public async get<T>(url: string): Promise<HttpResponse<T>> {
        let resp: HttpResponse<T> = {
            success: false,
            data: null,
            error: undefined
        };

        try {
            const response = await this.client.get<T>(url);
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp = this.returnErrors(error)
            console.error('Get failed:', resp);
        }

        return resp;
    }

    public async delete<T>(url: string): Promise<HttpResponse<T>> {
        let resp: HttpResponse<T> = {
            success: false,
            data: null,
            error: undefined
        };

        try {
            const response = await this.client.delete<T>(url);
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp = this.returnErrors(error)
        }

        return resp;
    }

    public returnErrors(error: any): HttpResponse<any> {

        const resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: error,
        };

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

        return resp;
    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }
}

export default new ApiClient();
