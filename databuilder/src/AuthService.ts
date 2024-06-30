import axios, { AxiosResponse } from 'axios';

export default class AuthService {
    private token: string | null = null;

    public async authenticate(email: string, password: string): Promise<string | boolean> {
        const url = `${process.env.REACT_APP_API_HOST}/auth/login/`;

        try {
            const response: AxiosResponse<{ access_token: string, refresh_token: string, user: object }> = await axios.post(url, {
                email,
                password,
            });

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
}