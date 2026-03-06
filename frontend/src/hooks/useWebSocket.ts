import { useState, useEffect, useRef, useCallback } from 'react';
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

export function useWebSocket(url: string) {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const typingTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const wsUrl = `${url}?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => setIsConnected(true);
        ws.current.onclose = () => setIsConnected(false);

        ws.current.onmessage = (event) => {
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

                    if (typingTimeoutRef.current[data.sender_id]) {
                        clearTimeout(typingTimeoutRef.current[data.sender_id]);
                    }

                    typingTimeoutRef.current[data.sender_id] = setTimeout(() => {
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

        return () => ws.current?.close();
    }, [url]);

    const sendChatMessage = useCallback((receiverId: number, content: string) => {
        if (ws.current && isConnected) {
            ws.current.send(JSON.stringify({ type: 'chat_message', receiver_id: receiverId, content }));
        }
    }, [isConnected]);

    const sendTyping = useCallback((receiverId: number) => {
        if (ws.current && isConnected) {
            ws.current.send(JSON.stringify({ type: 'typing', receiver_id: receiverId }));
        }
    }, [isConnected]);

    const sendReadReceipt = useCallback((receiverId: number, messageIds: number[]) => {
        if (ws.current && isConnected && messageIds.length > 0) {
            ws.current.send(JSON.stringify({ type: 'read_receipt', receiver_id: receiverId, message_ids: messageIds }));
        }
    }, [isConnected]);

    return { isConnected, sendChatMessage, sendTyping, sendReadReceipt };
}
