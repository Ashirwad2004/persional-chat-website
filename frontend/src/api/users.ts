import apiClient from './client';
import { User } from '../store/chatStore';

export const usersApi = {
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('/users');
        return response.data;
    },

    uploadAvatar: async (file: File): Promise<User> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
