import axios, {AxiosInstance} from 'axios';

export interface HttpResponse<T = any> {
    success: boolean;
    data?: T | null;
    error?: string;
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
            const csrfToken = this.getCookie('csrftoken');
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
            if (localStorage.getItem("appOS") && localStorage.getItem('djmote_token')) {
                config.headers['X-App-Client'] = localStorage.getItem("appOS")
                config.headers['Authorization'] = `Bearer ${localStorage.getItem('djmote_token')}`;
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

    public async post<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        const resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.post<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp.error = this.errorToString(error)
        }

        return resp;
    }

    public async put<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        const resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.put<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp.error = this.errorToString(error)
        }

        return resp;
    }

    public async patch<T>(url: string, data: any, headers: any = {}): Promise<HttpResponse<T>> {
        const resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined,
        };

        try {
            const response = await this.client.patch<T>(url, data, {headers});
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp.error = this.errorToString(error)
        }

        return resp;
    }

    public async get<T>(url: string): Promise<HttpResponse<T>> {
        const resp: HttpResponse<T> = {
            success: false,
            data: null,
            error: undefined
        };

        try {
            const response = await this.client.get<T>(url);
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp.error = this.errorToString(error)
            console.error('Get failed:', error.message);
        }

        return resp;
    }

    public async delete<T>(url: string): Promise<HttpResponse<T>> {
        const resp: HttpResponse<any> = {
            success: false,
            data: null,
            error: undefined
        };

        try {
            const response = await this.client.delete<T>(url);
            resp.data = response.data;
            resp.success = true;
        } catch (error: any) {
            resp.error = this.errorToString(error)
            console.error('Get failed:', error.message);
        }

        return resp;
    }

    private errorToString(error: any) {
        let found = undefined;
        if (!error) return found;
        if (typeof error === 'string') return error;

        if (axios.isAxiosError(error) && error.response) {
            found = error.response.data;
        } else if (error.error) {
            found = error.error
        } else if (error) {
            found = error
        }
        if (found && typeof found === 'object') {
            found = Object.values(found).join(", ");
        }
        return found;
    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }
}

export default new ApiClient();