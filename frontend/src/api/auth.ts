import apiClient from './client';

export const authApi = {
    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    signup: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/register', {
            email,
            password
        });
        return response.data;
    }
};