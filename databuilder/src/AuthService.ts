import axios, {AxiosResponse} from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import https from 'https';

var tough = require("tough-cookie");
axios.defaults.withCredentials = true;
const cookieJar = new tough.CookieJar();
export const client = wrapper(axios.create({
  jar: cookieJar,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Disable SSL verification
  }),
  withCredentials: true,
}));


export default class AuthService {
    private token: string | null = null;

    public async authenticate(email: string, password: string): Promise<string | boolean> {
        const url = `${process.env.REACT_APP_API_HOST}/auth/login/`;

        try {
            const response: AxiosResponse<{
                access_token: string,
                refresh_token: string,
                user: object
            }> = await client.post(url, {
                email,
                password,
            });

            const cookies = cookieJar.getCookiesSync(url);
            console.log('Cookies:', cookies);

            return response.data.access_token;
        } catch (error: any) {
            if (error.response?.data) {
                console.error(error.response.data);
            } else {
                console.error(typeof error.message === 'string' ? error.message : "Unknown authentication error on login");
            }

            return false;
        }
    }

    public async send_verification(email: string): Promise<string | boolean> {
        const url = `${process.env.REACT_APP_API_HOST}/auth/resend-email/`;

        try {
            const response: AxiosResponse<{ detail: string }> = await client.post(url, {
                email
            });

            return response.data.detail;
        } catch (error: any) {
            if (error.response?.data) {
                console.error(error.response.data);
            } else {
                console.error(typeof error.message === 'string' ? error.message : "Unknown authentication error on login");
            }

            return false;
        }
    }



}