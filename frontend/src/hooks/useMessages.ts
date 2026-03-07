import { useCallback } from 'react';
import { messagesApi } from '../api/messages';
import { useChatStore } from '../store/chatStore';

export function useMessages() {
    const { setSummaries, setMessages } = useChatStore();

    const fetchSummaries = useCallback(async () => {
        try {
            const data = await messagesApi.getSummaries();
            const sumMap: Record<number, { last_message: string; unread_count: number }> = {};
            data.forEach(s => {
                sumMap[s.user_id] = { last_message: s.last_message, unread_count: s.unread_count };
            });
            setSummaries(() => sumMap);
        } catch (error) {
            console.error("Failed to fetch summaries", error);
        }
    }, [setSummaries]);

    const fetchChatHistory = useCallback(async (userId: number) => {
        try {
            const data = await messagesApi.getChatHistory(userId, undefined, 20);
            setMessages(data);
            useChatStore.getState().setHasMoreMessages(data.length === 20);
            return data;
        } catch (error) {
            console.error("Failed to fetch chat history", error);
            return [];
        }
    }, [setMessages]);

    const loadMoreMessages = useCallback(async (userId: number, cursor: number) => {
        try {
            const data = await messagesApi.getChatHistory(userId, cursor, 20);
            if (data.length > 0) {
                setMessages(prev => [...data, ...prev]);
            }
            useChatStore.getState().setHasMoreMessages(data.length === 20);
            return data;
        } catch (error) {
            console.error("Failed to load more messages", error);
            return [];
        }
    }, [setMessages]);

    const markAsRead = useCallback(async (userId: number) => {
        try {
            await messagesApi.markAsRead(userId);
            setSummaries(prev => ({
                ...prev,
                [userId]: { ...prev[userId], unread_count: 0 }
            }));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    }, [setSummaries]);

    const deleteChatHistory = useCallback(async (userId: number) => {
        try {
            await messagesApi.deleteChatHistory(userId);
            setMessages([]);
        } catch (error) {
            console.error("Failed to delete chat history", error);
        }
    }, [setMessages]);

    return { fetchSummaries, fetchChatHistory, loadMoreMessages, markAsRead, deleteChatHistory };
}
