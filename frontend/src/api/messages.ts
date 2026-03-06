import apiClient from './client';
import { ChatMessage } from '../store/chatStore';

export interface SummaryData {
    user_id: number;
    last_message: string;
    unread_count: number;
}

export const messagesApi = {
    getSummaries: async (): Promise<SummaryData[]> => {
        const response = await apiClient.get('/messages/summary');
        return response.data;
    },

    getChatHistory: async (userId: number): Promise<ChatMessage[]> => {
        const response = await apiClient.get(`/messages/${userId}`);
        return response.data;
    },

    markAsRead: async (userId: number): Promise<void> => {
        await apiClient.put(`/messages/${userId}/read`);
    },

    deleteChatHistory: async (userId: number): Promise<void> => {
        await apiClient.delete(`/messages/${userId}`);
    }
};
