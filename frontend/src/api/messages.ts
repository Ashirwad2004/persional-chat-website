import apiClient from "./client";
import { ChatMessage } from "../store/chatStore";

export interface SummaryData {
    user_id: number;
    last_message: string;
    unread_count: number;
    timestamp?: string;
}

export const messagesApi = {
    // Get chat summaries
    getSummaries: async (): Promise<SummaryData[]> => {
        try {
            const response = await apiClient.get("/messages/summary");
            return response.data;
        } catch (error) {
            console.error("Error fetching summaries:", error);
            throw error;
        }
    },

    // Get chat history with pagination
    getChatHistory: async (
        userId: number,
        cursor?: number,
        limit: number = 20
    ): Promise<ChatMessage[]> => {
        try {
            const response = await apiClient.get(`/messages/${userId}`, {
                params: {
                    cursor: cursor ?? undefined,
                    limit: limit,
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching chat history:", error);
            throw error;
        }
    },

    // Mark messages as read
    markAsRead: async (userId: number): Promise<void> => {
        try {
            await apiClient.put(`/messages/${userId}/read`);
        } catch (error) {
            console.error("Error marking messages as read:", error);
            throw error;
        }
    },

    // Delete chat history
    deleteChatHistory: async (userId: number): Promise<void> => {
        try {
            await apiClient.delete(`/messages/${userId}`);
        } catch (error) {
            console.error("Error deleting chat history:", error);
            throw error;
        }
    },

    uploadAudio: async (audioBlob: Blob): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        const response = await apiClient.post('/messages/upload-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};