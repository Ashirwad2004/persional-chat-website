import { useState, useEffect, useCallback } from 'react';
import { useChatStore, ChatMessage } from '../store/chatStore';

export interface BaseEvent {
    type: 'chat_message' | 'presence' | 'typing' | 'read_receipt';
}

export interface ChatMessageEvent extends BaseEvent {
    type: 'chat_message';
    message: ChatMessage;
}

export interface PresenceEvent extends BaseEvent {
    type: 'presence';
    user_id: number;
    is_online: boolean;
}

export interface TypingEvent extends BaseEvent {
    type: 'typing';
    sender_id: number;
    receiver_id: number;
}

export interface ReadReceiptEvent extends BaseEvent {
    type: 'read_receipt';
    sender_id: number;
    receiver_id: number;
    message_ids: number[];
}

export type WsEvent = ChatMessageEvent | PresenceEvent | TypingEvent | ReadReceiptEvent;

// Singleton WebSocket state
let wsInstance: WebSocket | null = null;
const listeners = new Set<(status: boolean) => void>();
const typingTimeouts: Record<number, ReturnType<typeof setTimeout>> = {};

const handleMessage = (event: MessageEvent) => {
    try {
        const data: WsEvent = JSON.parse(event.data);
        const store = useChatStore.getState();

        if (data.type === 'presence') {
            store.setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (data.is_online) newSet.add(data.user_id);
                else newSet.delete(data.user_id);
                return newSet;
            });
        } else if (data.type === 'typing') {
            store.setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(data.sender_id);
                return newSet;
            });

            if (typingTimeouts[data.sender_id]) {
                clearTimeout(typingTimeouts[data.sender_id]);
            }

            typingTimeouts[data.sender_id] = setTimeout(() => {
                useChatStore.getState().setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.sender_id);
                    return newSet;
                });
            }, 3000);
        } else if (data.type === 'read_receipt') {
            store.setMessages(prev => prev.map(msg =>
                data.message_ids.includes(msg.id) ? { ...msg, is_read: true } : msg
            ));
        } else if (data.type === 'chat_message') {
            const msg = data.message;
            const currentUser = store.currentUser;
            const activeUser = store.activeUser;

            store.setSummaries(prev => ({
                ...prev,
                [msg.sender_id === currentUser?.id ? msg.receiver_id : msg.sender_id]: {
                    last_message: msg.content,
                    unread_count: (msg.sender_id !== currentUser?.id && activeUser?.id !== msg.sender_id)
                        ? (prev[msg.sender_id]?.unread_count || 0) + 1
                        : 0
                }
            }));

            if (activeUser && (
                (msg.sender_id === activeUser.id && msg.receiver_id === currentUser?.id) ||
                (msg.sender_id === currentUser?.id && msg.receiver_id === activeUser.id)
            )) {
                store.addMessage(msg);
            }
        }
    } catch (error) {
        console.error('WebSocket parse error', event.data);
    }
};

export function useWebSocket(url: string) {
    const [isConnected, setIsConnected] = useState(wsInstance?.readyState === WebSocket.OPEN);

    useEffect(() => {
        const handleStatusChange = (status: boolean) => setIsConnected(status);
        listeners.add(handleStatusChange);

        // Initial state sync in case it connected before this component mounted
        setIsConnected(wsInstance?.readyState === WebSocket.OPEN);

        const token = localStorage.getItem('access_token');
        if (!token) return;

        if (!wsInstance || wsInstance.readyState === WebSocket.CLOSED) {
            const wsUrl = `${url}?token=${token}`;
            wsInstance = new WebSocket(wsUrl);

            wsInstance.onopen = () => {
                listeners.forEach(l => l(true));
            };

            wsInstance.onclose = () => {
                listeners.forEach(l => l(false));
                wsInstance = null;
            };

            wsInstance.onmessage = handleMessage;
        }

        return () => {
            listeners.delete(handleStatusChange);
            // We do NOT close the singleton WebSocket here, as it services the whole app
        };
    }, [url]);

    const sendChatMessage = useCallback((receiverId: number, content: string) => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify({ type: 'chat_message', receiver_id: receiverId, content }));
        }
    }, [isConnected]);

    const sendTyping = useCallback((receiverId: number) => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify({ type: 'typing', receiver_id: receiverId }));
        }
    }, [isConnected]);

    const sendReadReceipt = useCallback((receiverId: number, messageIds: number[]) => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN && messageIds.length > 0) {
            wsInstance.send(JSON.stringify({ type: 'read_receipt', receiver_id: receiverId, message_ids: messageIds }));
        }
    }, [isConnected]);

    return { isConnected, sendChatMessage, sendTyping, sendReadReceipt };
}
